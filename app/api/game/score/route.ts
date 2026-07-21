import { json, preflight, readJson } from "@/lib/http";
import { accountIdFromRequest } from "@/lib/auth";
import { getAccount } from "@/lib/store";
import { awardForGame } from "@/lib/loyalty";

export const runtime = "nodejs";

// The native game POSTs here at game-over. Converts the run into loyalty points (daily-capped),
// and keeps the account's best score in sync. This is the heart of "play to earn".
export async function POST(req: Request) {
  const id = accountIdFromRequest(req);
  if (!id) return json({ error: "unauthorized" }, 401);
  const acc = getAccount(id);
  if (!acc) return json({ error: "not found" }, 404);

  const { score = 0, eggs = 0 } = await readJson<{ score?: number; eggs?: number }>(req);
  const s = Math.max(0, Math.min(1_000_000, Math.floor(Number(score) || 0)));
  const e = Math.max(0, Math.min(1_000_000, Math.floor(Number(eggs) || 0)));

  const result = awardForGame(acc, e, s);
  return json({
    awarded: result.awarded,
    points: result.points,
    dailyRemaining: result.dailyRemaining,
    cappedOut: result.cappedOut,
    bestScore: acc.bestScore,
  });
}

export function OPTIONS() {
  return preflight();
}
