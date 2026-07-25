import { getOrderByPairCode } from "@/lib/orders";
import { json, preflight } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The app resolves the short code from the text/deep-link to the order it should page.
export async function GET(req: Request) {
  const code = (new URL(req.url).searchParams.get("code") || "").trim().toUpperCase();
  if (!code) return json({ error: "code required" }, 400);
  const o = await getOrderByPairCode(code);
  if (!o) return json({ error: "no match" }, 404);
  if (o.status === "collected" || o.status === "canceled") return json({ error: "order closed" }, 410);
  return json({ orderId: o.id, num: o.num, status: o.status });
}

export function OPTIONS() { return preflight(); }
