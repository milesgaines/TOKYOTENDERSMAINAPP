// When an order is fired, the guest gets a text to play the egg game while their food cooks. We DON'T
// use a paid SMS gateway (Twilio) — the text is sent from the restaurant's OWN number: the kitchen
// board shows a one-tap "Text to play" that opens the device's Messages app pre-filled (see
// smsHref/kitchen page). This module just builds the links and logs the ticket; the buzz on ready is
// handled separately (APNs push + the in-app poll).
import type { Order } from "./orders";

function origin(): string {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3210";
}

// The customer-facing link: a page that opens the app to this order (or sends them to install it).
export function playLink(o: Order): string {
  return `${origin()}/play?c=${o.pairCode}`;
}

// The staff magic link that fires the buzz (alternative to tapping the kitchen board).
export function readyLink(o: Order): string {
  return `${origin()}/api/order/${o.id}/ready?token=${o.readyToken}`;
}

// A pre-filled SMS the restaurant device sends FROM ITS OWN NUMBER (no Twilio). Used by the board.
export function smsHref(o: Order): string {
  const body = `🍗 Tokyo Tenders — order #${o.num} is cooking! Beat our egg game while you wait, we'll buzz you the second it's ready: ${playLink(o)}`;
  const to = (o.customerPhone || "").replace(/[^\d+]/g, "");
  // iOS/macOS Messages honor `sms:<number>?&body=`; the staffer just taps Send.
  return `sms:${to}?&body=${encodeURIComponent(body)}`;
}

// Optional staff heads-up email (for kitchens not watching the board) with the tap-to-buzz link.
async function notifyStaffEmail(o: Order) {
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
  console.log(`\n🍗 ORDER #${o.num} (${o.customerName}${o.customerPhone ? " " + o.customerPhone : ""}) code ${o.pairCode}\n   PLAY LINK (text the guest from the shop number): ${playLink(o)}\n   READY LINK (staff taps): ${readyLink(o)}\n`);
  await notifyStaffEmail(o);
}
