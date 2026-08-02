// Apple Push Notifications — the ready-buzz that reaches a LOCKED or backgrounded phone (the poll
// only works while the app is open). Signs a provider JWT (ES256) with the APNs auth key and pushes
// an alert to every device token registered for the order.
//
// Env (from the restaurant's Apple Developer account — owner must enable Push on the App ID + make a key):
//   APNS_KEY_ID        — the .p8 key's Key ID
//   APNS_TEAM_ID       — Apple Developer Team ID
//   APNS_AUTH_KEY      — the .p8 file contents (PEM, "-----BEGIN PRIVATE KEY----- …")
//   APNS_BUNDLE_ID     — com.tokyotenders.game (the apns-topic)
//   APNS_ENV           — "production" (default) or "sandbox" (dev builds)
import crypto from "node:crypto";
import http2 from "node:http2";
import type { Order } from "./orders";

export function apnsConfigured(): boolean {
  return !!(process.env.APNS_KEY_ID && process.env.APNS_TEAM_ID && process.env.APNS_AUTH_KEY && process.env.APNS_BUNDLE_ID);
}

// Provider token, cached ~50 min (APNs accepts tokens up to 60 min old).
type Tok = { jwt: string; iat: number };
const g = globalThis as unknown as { __apnsTok?: Tok };
function providerToken(): string | null {
  if (!apnsConfigured()) return null;
  const now = Math.floor(Date.now() / 1000);
  if (g.__apnsTok && now - g.__apnsTok.iat < 3000) return g.__apnsTok.jwt;
  const header = { alg: "ES256", kid: process.env.APNS_KEY_ID };
  const payload = { iss: process.env.APNS_TEAM_ID, iat: now };
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const signingInput = `${b64(header)}.${b64(payload)}`;
  const key = (process.env.APNS_AUTH_KEY as string).replace(/\\n/g, "\n");
  const sig = crypto.sign("sha256", Buffer.from(signingInput), { key, dsaEncoding: "ieee-p1363" }).toString("base64url");
  const jwt = `${signingInput}.${sig}`;
  g.__apnsTok = { jwt, iat: now };
  return jwt;
}

function host(): string {
  return (process.env.APNS_ENV === "sandbox") ? "https://api.sandbox.push.apple.com" : "https://api.push.apple.com";
}

async function pushOne(token: string, jwt: string, payload: object): Promise<{ ok: boolean; status: number; body: string }> {
  return new Promise((resolve) => {
    const client = http2.connect(host());
    client.on("error", () => resolve({ ok: false, status: 0, body: "connect error" }));
    const body = JSON.stringify(payload);
    const req = client.request({
      ":method": "POST",
      ":path": `/3/device/${token}`,
      authorization: `bearer ${jwt}`,
      "apns-topic": process.env.APNS_BUNDLE_ID as string,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "content-type": "application/json",
      "content-length": Buffer.byteLength(body),
    });
    let status = 0, resp = "";
    req.on("response", (h) => { status = Number(h[":status"]) || 0; });
    req.on("data", (d) => { resp += d; });
    req.on("end", () => { client.close(); resolve({ ok: status === 200, status, body: resp }); });
    req.on("error", () => { client.close(); resolve({ ok: false, status: 0, body: "req error" }); });
    req.end(body);
  });
}

/** Push the ready-buzz to every device tracking this order. No-op (logs) when APNs isn't configured. */
export async function sendReadyPush(o: Order): Promise<void> {
  const tokens = o.deviceTokens ?? [];
  const jwt = providerToken();
  if (!jwt || tokens.length === 0) {
    console.log(`🔔 ready-push for #${o.num}: ${tokens.length} device(s), apns ${apnsConfigured() ? "configured" : "NOT configured"} — ${jwt ? "sending" : "skipped"}`);
    if (!jwt) return;
  }
  const payload = {
    aps: {
      alert: { title: "🍗 Order Ready!", body: `Order #${o.num} is up — come grab your tenders while they're hot.` },
      sound: "default", badge: 1, "interruption-level": "time-sensitive",
    },
    orderId: o.id, num: o.num,
  };
  const results = await Promise.allSettled(tokens.map((t) => pushOne(t, jwt, payload)));
  results.forEach((r, i) => {
    if (r.status === "fulfilled") console.log(`🔔 push #${o.num} → ${tokens[i].slice(0, 8)}… status ${r.value.status}${r.value.ok ? "" : " " + r.value.body}`);
    else console.error(`🔔 push #${o.num} failed`, r.reason);
  });
}
