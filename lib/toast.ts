// Toast POS integration. Toast posts order webhooks here; we authenticate (OAuth client-credentials),
// fetch the full order to pull the guest phone + display number, and map Toast's lifecycle to our
// pager: order fired → text the customer to play; order ready/fulfilled → buzz.
//
// Env (from the restaurant's Toast partner/developer account):
//   TOAST_CLIENT_ID, TOAST_CLIENT_SECRET   — API credentials
//   TOAST_RESTAURANT_GUID                   — the location's external GUID (Toast-Restaurant-External-ID)
//   TOAST_WEBHOOK_SECRET                    — shared secret to verify the Toast-Signature header
//   TOAST_API_HOST                          — ws-api.toasttab.com (prod) / ws-sandbox-api.toasttab.com
import crypto from "node:crypto";

export function toastConfigured(): boolean {
  return !!(process.env.TOAST_CLIENT_ID && process.env.TOAST_CLIENT_SECRET && process.env.TOAST_RESTAURANT_GUID);
}

function host(): string {
  return (process.env.TOAST_API_HOST || "ws-api.toasttab.com").replace(/^https?:\/\//, "").replace(/\/$/, "");
}

type TokenCache = { token: string; exp: number };
const g = globalThis as unknown as { __toastTok?: TokenCache };

async function getToken(): Promise<string | null> {
  const now = Date.now();
  if (g.__toastTok && g.__toastTok.exp > now + 30_000) return g.__toastTok.token;
  if (!toastConfigured()) return null;
  try {
    const r = await fetch(`https://${host()}/authentication/v1/authentication/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: process.env.TOAST_CLIENT_ID,
        clientSecret: process.env.TOAST_CLIENT_SECRET,
        userAccessType: "TOAST_MACHINE_CLIENT",
      }),
    });
    if (!r.ok) { console.error("toast auth failed", r.status); return null; }
    const d = await r.json();
    const tok = d?.token?.accessToken as string | undefined;
    const ttl = (d?.token?.expiresIn as number | undefined) ?? 3600;
    if (!tok) return null;
    g.__toastTok = { token: tok, exp: now + ttl * 1000 };
    return tok;
  } catch (e) { console.error("toast auth error", e); return null; }
}

export async function fetchToastOrder(guid: string): Promise<any | null> {
  const tok = await getToken();
  if (!tok) return null;
  try {
    const r = await fetch(`https://${host()}/orders/v2/orders/${encodeURIComponent(guid)}`, {
      headers: { Authorization: `Bearer ${tok}`, "Toast-Restaurant-External-ID": process.env.TOAST_RESTAURANT_GUID as string },
    });
    if (!r.ok) { console.error("toast order fetch failed", r.status); return null; }
    return await r.json();
  } catch (e) { console.error("toast order fetch error", e); return null; }
}

// Verify the Toast-Signature header (HMAC-SHA256 of the raw body, base64). If no secret is set we
// allow it through (dev) but log — set TOAST_WEBHOOK_SECRET in prod.
export function verifyToastSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.TOAST_WEBHOOK_SECRET;
  if (!secret) { console.warn("TOAST_WEBHOOK_SECRET unset — not verifying webhook signature"); return true; }
  if (!signature) return false;
  const mac = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const a = Buffer.from(mac), b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// --- tolerant extractors (finalize against a real Toast test event; raw payload is logged) ---

export function guestPhone(order: any): string | undefined {
  const c = order?.checks?.[0]?.customer;
  const raw = c?.phone || c?.phoneNumber || order?.deliveryInfo?.phone;
  if (!raw) return undefined;
  const digits = String(raw).replace(/[^\d]/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits ? `+${digits}` : undefined;
}

export function guestName(order: any): string {
  const c = order?.checks?.[0]?.customer;
  const n = [c?.firstName, c?.lastName].filter(Boolean).join(" ").trim();
  return n || order?.checks?.[0]?.tabName || "Guest";
}

// A short, human display number for the ticket (Toast's check display number when present).
export function displayNumber(order: any): number | undefined {
  const d = order?.checks?.[0]?.displayNumber ?? order?.displayNumber;
  const n = parseInt(String(d ?? ""), 10);
  return Number.isFinite(n) ? n : undefined;
}

// Is this order/selection in a READY / fulfilled state? Toast fulfillment states include READY.
export function looksReady(payload: any, order: any): boolean {
  const hay = JSON.stringify({ e: payload?.eventType ?? payload?.eventCategory, o: order?.checks }).toUpperCase();
  return /"READY"|FULFILLED|ORDER_READY|BUMP/.test(hay);
}
