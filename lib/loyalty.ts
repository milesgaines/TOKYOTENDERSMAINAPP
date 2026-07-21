// Play-to-earn loyalty engine. Catching eggs in the game converts to points, capped per day
// so it can't be farmed; points redeem into a coupon the Square checkout applies.
import crypto from "node:crypto";
import { Account, Redemption, saveAccount, createRedemption } from "./store";

const POINTS_PER_100_EGGS = Number(process.env.TT_POINTS_PER_100_EGGS || 10);
const DAILY_CAP = Number(process.env.TT_DAILY_POINT_CAP || 30);
const POINTS_PER_DOLLAR = Number(process.env.TT_POINTS_PER_DOLLAR || 20);

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export type AwardResult = { awarded: number; points: number; dailyRemaining: number; cappedOut: boolean };

/** Award points for one finished game. `eggs` = eggs caught this run (score also accepted as a fallback). */
export function awardForGame(acc: Account, eggs: number, score: number): AwardResult {
  const day = today();
  if (acc.earnedDay !== day) {
    acc.earnedDay = day;
    acc.earnedToday = 0;
  }
  const caught = Math.max(0, Math.floor(eggs || Math.floor(score / 5) || 0));
  const raw = Math.floor((caught * POINTS_PER_100_EGGS) / 100);
  const dailyRemaining = Math.max(0, DAILY_CAP - acc.earnedToday);
  const awarded = Math.min(raw, dailyRemaining);

  acc.points += awarded;
  acc.earnedToday += awarded;
  acc.totalEggs += caught;
  if (score > acc.bestScore) acc.bestScore = score;
  saveAccount(acc);

  return { awarded, points: acc.points, dailyRemaining: dailyRemaining - awarded, cappedOut: raw > awarded };
}

export type RedeemResult =
  | { ok: true; code: string; dollars: number; points: number; remaining: number }
  | { ok: false; error: string };

/** Redeem points into a coupon code (dollars off) usable at Square checkout. */
export function redeemPoints(acc: Account, points: number): RedeemResult {
  const p = Math.floor(points);
  if (!Number.isFinite(p) || p <= 0) return { ok: false, error: "invalid_amount" };
  if (p % POINTS_PER_DOLLAR !== 0) return { ok: false, error: `points must be a multiple of ${POINTS_PER_DOLLAR}` };
  if (p > acc.points) return { ok: false, error: "insufficient_points" };

  const dollars = p / POINTS_PER_DOLLAR;
  acc.points -= p;
  saveAccount(acc);

  const code = "TT-" + crypto.randomBytes(4).toString("hex").toUpperCase();
  const r: Redemption = { code, accountId: acc.id, points: p, dollars, createdAt: Date.now(), usedAt: null };
  createRedemption(r);
  // NOTE (prod): also create the matching Square discount/coupon via the Square Loyalty or
  // Orders API so the code is honored at checkout. See lib/square.ts stub.
  return { ok: true, code, dollars, points: acc.points, remaining: acc.points };
}

export const loyaltyConfig = { POINTS_PER_100_EGGS, DAILY_CAP, POINTS_PER_DOLLAR };
