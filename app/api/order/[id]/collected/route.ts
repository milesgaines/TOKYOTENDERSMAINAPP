import { getOrder, setOrderStatus } from "@/lib/orders";
import { json, preflight } from "@/lib/http";

export const runtime = "nodejs";

// Customer tapped "Got it" on the pager (or staff cleared it) — drop the ticket off the board.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const o = await getOrder(params.id);
  if (!o) return json({ error: "not found" }, 404);
  if (o.status === "ready" || o.status === "cooking" || o.status === "new") {
    await setOrderStatus(params.id, "collected");
  }
  return json({ ok: true, status: "collected" });
}

export function OPTIONS() { return preflight(); }
