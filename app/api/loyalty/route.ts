import { json, preflight } from "@/lib/http";
import { accountIdFromRequest } from "@/lib/auth";
import { getAccount } from "@/lib/store";
import { loyaltyConfig } from "@/lib/loyalty";

export const runtime = "nodejs";

// Current loyalty balance + progress for the signed-in account (shown in the game's Rewards
// screen and the web storefront alike).
export async function GET(req: Request) {
  const id = accountIdFromRequest(req);
  if (!id) return json({ error: "unauthorized" }, 401);
  const acc = getAccount(id);
  if (!acc) return json({ error: "not found" }, 404);
  return json({
    points: acc.points,
    bestScore: acc.bestScore,
    totalEggs: acc.totalEggs,
    earnedToday: acc.earnedDay === new Date().toISOString().slice(0, 10) ? acc.earnedToday : 0,
    config: loyaltyConfig,
  });
}

export function OPTIONS() {
  return preflight();
}
