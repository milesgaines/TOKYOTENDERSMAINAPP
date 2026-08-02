import { getOrderByPairCode, getOpenOrderByNum } from "@/lib/orders";
import { json, preflight } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Resolve a pairing value to the order to page. Accepts either the short pair code OR the ticket
// number printed on the receipt (all-digits) — the free, self-serve path (no SMS).
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const raw = (p.get("code") || p.get("ticket") || "").trim().toUpperCase();
  if (!raw) return json({ error: "code required" }, 400);
  const o = /^\d+$/.test(raw) ? await getOpenOrderByNum(parseInt(raw, 10)) : await getOrderByPairCode(raw);
  if (!o) return json({ error: "no match" }, 404);
  if (o.status === "collected" || o.status === "canceled") return json({ error: "order closed" }, 410);
  return json({ orderId: o.id, num: o.num, status: o.status });
}

export function OPTIONS() { return preflight(); }
