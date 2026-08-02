import { getOrder, setOrderStatus } from "./orders";
import { sendReadyPush } from "./apns";

// The one place an order becomes READY. Flips status (idempotent) and, only on the first transition,
// pushes the buzz to any registered device — so a locked/backgrounded phone still goes off.
export async function markReady(id: string) {
  const before = await getOrder(id);
  const wasReady = before?.status === "ready" || before?.status === "collected";
  const o = await setOrderStatus(id, "ready");
  if (o && !wasReady) await sendReadyPush(o);
  return o;
}
