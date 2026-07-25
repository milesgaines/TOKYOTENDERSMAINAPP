// When an order is fired at the counter, text the CUSTOMER a link to play the egg game while their
// food cooks — their phone buzzes when the kitchen marks it ready. The kitchen board (and an optional
// staff email/SMS) is the ready-signal side. With NO keys set it still logs everything so the whole
// flow is testable today; Twilio just makes the customer text real.
import type { Order } from "./orders";

function origin(): string {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3210";
}

// The customer-facing link: a web page that opens the app to this order (or sends them to install it).
export function playLink(o: Order): string {
  return `${origin()}/play?c=${o.pairCode}`;
}

// The staff magic link that fires the buzz (alternative to tapping the kitchen board).
export function readyLink(o: Order): string {
  return `${origin()}/api/order/${o.id}/ready?token=${o.readyToken}`;
}

async function twilio(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID, tok = process.env.TWILIO_AUTH_TOKEN, from = process.env.TWILIO_FROM;
  if (!sid || !tok || !from || !to) return;
  try {
    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: "Basic " + Buffer.from(`${sid}:${tok}`).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ From: from, To: to, Body: body }).toString(),
    });
  } catch (e) { console.error("twilio failed", e); }
}

// Text the customer: play while you wait.
async function textCustomer(o: Order) {
  if (!o.customerPhone) return;
  const body = `🍗 Tokyo Tenders — order #${o.num} is cooking! Beat our egg game while you wait, we'll buzz you the second it's ready: ${playLink(o)}`;
  await twilio(o.customerPhone, body);
}

// Optional staff heads-up (for kitchens not watching the board) with the tap-to-buzz link.
async function notifyStaff(o: Order) {
  const to = process.env.STORE_SMS_TO;
  if (to) await twilio(to, `NEW #${o.num} — ${o.customerName}${o.note ? ` (${o.note})` : ""}\nTAP WHEN READY: ${readyLink(o)}`);

  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const html = `<div style="font-family:system-ui;max-width:440px">
    <h2 style="color:#ff5500;margin:0">ORDER #${o.num}</h2>
    <p><b>${o.customerName}</b>${o.customerPhone ? ` · ${o.customerPhone}` : ""}${o.note ? `<br><i>${o.note}</i>` : ""}</p>
    <a href="${readyLink(o)}" style="display:block;margin-top:16px;background:#ff5500;color:#fff;text-align:center;padding:16px;border-radius:12px;font-size:18px;font-weight:800;text-decoration:none">🔔 TAP WHEN READY</a>
    <p style="color:#888;font-size:12px">Tapping buzzes the customer's phone. Or use the kitchen board.</p></div>`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Tokyo Tenders <onboarding@resend.dev>", to: [process.env.STORE_EMAIL || "tokyotenders@gmail.com"], subject: `ORDER #${o.num} — ${o.customerName}`, html }),
    });
  } catch (e) { console.error("resend failed", e); }
}

export async function dispatchOrder(o: Order): Promise<void> {
  console.log(`\n🍗 ORDER #${o.num} (${o.customerName}${o.customerPhone ? " " + o.customerPhone : ""}) code ${o.pairCode}\n   PLAY LINK (texts customer): ${playLink(o)}\n   READY LINK (staff taps): ${readyLink(o)}\n`);
  await Promise.allSettled([textCustomer(o), notifyStaff(o)]);
}
