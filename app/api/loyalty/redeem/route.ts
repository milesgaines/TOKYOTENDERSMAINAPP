import { json, preflight, readJson } from "@/lib/http";
import { accountIdFromRequest } from "@/lib/auth";
import { getAccount } from "@/lib/store";
import { redeemPoints } from "@/lib/loyalty";

export const runtime = "nodejs";

// Redeem points into a coupon code shown at the counter (dollars off).
export async function POST(req: Request) {
  const id = accountIdFromRequest(req);
  if (!id) return json({ error: "unauthorized" }, 401);
  const acc = getAccount(id);
  if (!acc) return json({ error: "not found" }, 404);

  const { points } = await readJson<{ points?: number }>(req);
  const result = redeemPoints(acc, Number(points));
  if (!result.ok) return json({ error: result.error }, 400);

  return json({ code: result.code, dollars: result.dollars, points: result.points });
}

export function OPTIONS() {
  return preflight();
}
