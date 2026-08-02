import { addDeviceToken } from "@/lib/orders";
import { json, preflight, readJson } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The app posts its APNs device token when it starts tracking an order, so the ready-buzz can reach
// it even when locked/backgrounded. The order id is the capability (guest orders have no account).
export async function POST(req: Request) {
  const body = await readJson<{ orderId?: string; token?: string }>(req);
  const token = (body.token || "").trim();
  if (!body.orderId || !token) return json({ error: "orderId and token required" }, 400);
  const ok = await addDeviceToken(body.orderId, token);
  if (!ok) return json({ error: "not found" }, 404);
  return json({ ok: true });
}

export function OPTIONS() { return preflight(); }
