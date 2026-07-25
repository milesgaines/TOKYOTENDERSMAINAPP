import { json, preflight } from "@/lib/http";
import { accountIdFromRequest } from "@/lib/auth";
import { getOrder } from "@/lib/orders";

export const runtime = "nodejs";

// The ONE status endpoint the iOS pager polls. Identical for the works-today and Square backends —
// it never changes; only what flips the status changes (a staff tap vs a Square webhook).
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const o = await getOrder(params.id);
  if (!o) return json({ error: "not found" }, 404);
  if (o.accountId && accountIdFromRequest(req) !== o.accountId) return json({ error: "forbidden" }, 403);
  return new Response(JSON.stringify({ orderId: o.id, num: o.num, status: o.status, readyAt: o.readyAt }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
  });
}

export function OPTIONS() {
  return preflight();
}
