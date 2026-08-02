import { createOrder, getOrderByExternalId, nextTicketNum, nextPairCode, rid, type Order } from "@/lib/orders";
import { markReady } from "@/lib/ready";
import { dispatchOrder } from "@/lib/notify";
import { fetchToastOrder, verifyToastSignature, guestPhone, guestName, displayNumber, looksReady } from "@/lib/toast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Toast posts order events here. Order fired → create our pager + text the guest to play the game.
// Order ready/fulfilled → flip status → the guest's phone buzzes. Idempotent by Toast order GUID.
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("Toast-Signature") || req.headers.get("toast-signature");
  if (!verifyToastSignature(raw, sig)) return new Response("bad signature", { status: 401 });

  let payload: any;
  try { payload = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }

  // Tolerant: Toast may send one event or a batch. Pull every order GUID we can find.
  const events: any[] = Array.isArray(payload) ? payload : Array.isArray(payload?.events) ? payload.events : [payload];
  const guids = events
    .map((e) => e?.guid || e?.orderGuid || e?.order?.guid || e?.data?.guid)
    .filter((x): x is string => typeof x === "string");

  console.log(`🔔 Toast webhook: ${guids.length} order(s) — raw:`, raw.slice(0, 800));

  const results = await Promise.allSettled(guids.map((guid, i) => handleOrder(guid, events[i] ?? payload)));
  results.forEach((r) => { if (r.status === "rejected") console.error("toast handleOrder failed:", r.reason); });
  return Response.json({ ok: true, handled: guids.length });
}

async function handleOrder(guid: string, event: any) {
  const order = await fetchToastOrder(guid); // full detail (phone/name/number); null if creds unset
  const existing = await getOrderByExternalId(guid);

  // Ready signal → buzz an order we're already tracking.
  if (existing && looksReady(event, order)) {
    if (existing.status !== "ready" && existing.status !== "collected") {
      await markReady(existing.id);
      console.log(`🔔 Toast → order #${existing.num} READY (buzz)`);
    }
    return;
  }
  if (existing) return; // already created, not ready yet — nothing to do

  // First time we see this order → create the pager and text the guest.
  const phone = order ? guestPhone(order) : undefined;
  const o: Order = {
    id: rid("ord_"), num: displayNumber(order) ?? nextTicketNum(), pairCode: nextPairCode(),
    accountId: null, customerName: order ? guestName(order) : "Guest", customerPhone: phone,
    status: "cooking", readyToken: rid("rt_"), source: "toast", externalId: guid,
    createdAt: Date.now(), readyAt: null,
  };
  await createOrder(o);
  if (!phone) console.warn(`Toast order ${guid} has no guest phone — pager created but no text sent (code ${o.pairCode})`);
  await dispatchOrder(o);
}
