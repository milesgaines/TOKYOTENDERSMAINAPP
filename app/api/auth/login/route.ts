import { json, preflight, readJson } from "@/lib/http";
import { createAccount } from "@/lib/store";
import { signToken } from "@/lib/auth";

export const runtime = "nodejs";

// Email-based sign-in that doubles as sign-up. Returns a shared account token used by BOTH
// the web storefront and the native game.
// PRODUCTION TODO: gate with a one-time code / magic link (email OTP) before issuing the token.
export async function POST(req: Request) {
  const { email } = await readJson<{ email?: string }>(req);
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: "valid email required" }, 400);
  }
  const acc = createAccount(email);
  const token = signToken(acc.id);
  return json({ token, account: { id: acc.id, email: acc.email, points: acc.points } });
}

export function OPTIONS() {
  return preflight();
}
