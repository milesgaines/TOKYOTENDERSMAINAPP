// Zero-dependency signed tokens (mini-JWT): base64url(payload).base64url(HMAC-SHA256).
// One account token is shared across the web storefront and the native game, so a high
// score, loyalty balance, and orders all tie to the same person ("shared account + login").
import crypto from "node:crypto";

const SECRET = process.env.TT_TOKEN_SECRET || "dev-insecure-secret-change-me";
const TTL_MS = 1000 * 60 * 60 * 24 * 90; // 90 days

type Payload = { sub: string; exp: number };

function b64(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function signToken(accountId: string): string {
  const payload: Payload = { sub: accountId, exp: Date.now() + TTL_MS };
  const body = b64(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  // constant-time compare
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    if (!payload.sub || typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload.sub;
  } catch {
    return null;
  }
}

/** Pull the account id from an Authorization: Bearer header. */
export function accountIdFromRequest(req: Request): string | null {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return verifyToken(m?.[1]);
}
