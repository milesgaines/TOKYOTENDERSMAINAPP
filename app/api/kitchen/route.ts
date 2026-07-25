import { listOpen, setOrderStatus, getOrder, createOrder, nextTicketNum, nextPairCode, rid, type Order } from "@/lib/orders";
import { dispatchOrder } from "@/lib/notify";
import { json, preflight, readJson } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Staff-only view of live orders. STAFF_KEY gates it; if unset (dev) it's open so the board works
// out of the box. The board is the restaurant side of the pager — tap READY and the phone buzzes.
function authed(key: string | null): boolean {
  const k = process.env.STAFF_KEY;
  return !k || key === k;
}

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  if (!authed(key)) return json({ error: "unauthorized" }, 401);
  const orders = (await listOpen()).map((o) => ({
    id: o.id, num: o.num, pairCode: o.pairCode, status: o.status, customerName: o.customerName,
    customerPhone: o.customerPhone, note: o.note, createdAt: o.createdAt, readyAt: o.readyAt,
    items: (o.items ?? []).map((i) => ({ name: i.name, qty: i.qty, flavors: i.flavors, sauces: i.sauces })),
  }));
  return json({ orders });
}

export async function POST(req: Request) {
  const body = await readJson<{
    key?: string; id?: string; action?: "create" | "ready" | "collected" | "canceled";
    name?: string; phone?: string; note?: string;
  }>(req);
  if (!authed(body.key ?? null)) return json({ error: "unauthorized" }, 401);

  // Staff fires a new pager (no Toast integration needed): make the ticket + text the customer.
  if (body.action === "create") {
    const name = (body.name || "").trim() || "Guest";
    const o: Order = {
      id: rid("ord_"), num: nextTicketNum(), pairCode: nextPairCode(), accountId: null,
      customerName: name, customerPhone: body.phone?.trim() || undefined, note: body.note?.trim() || undefined,
      status: "cooking", readyToken: rid("rt_"), source: "staff", externalId: null,
      createdAt: Date.now(), readyAt: null,
    };
    await createOrder(o);
    await dispatchOrder(o);
    return json({ ok: true, id: o.id, num: o.num, pairCode: o.pairCode });
  }

  if (!body.id || !body.action) return json({ error: "bad request" }, 400);
  const o = await getOrder(body.id);
  if (!o) return json({ error: "not found" }, 404);
  await setOrderStatus(body.id, body.action);
  return json({ ok: true, status: body.action });
}

export function OPTIONS() { return preflight(); }
