import { getOrder } from "@/lib/orders";
import { markReady } from "@/lib/ready";
import crypto from "node:crypto";

export const runtime = "nodejs";

// The magic link that IS the real ready signal. Staff tap it from the SMS/email/kitchen-board and
// the customer's pager fires. The unguessable per-order token is the auth (no login needed).
async function handle(req: Request, id: string) {
  const token = new URL(req.url).searchParams.get("token") || "";
  const o = await getOrder(id);
  if (!o) return page("Order not found", "#b00", 404);

  const a = Buffer.from(token), b = Buffer.from(o.readyToken);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return page("Invalid link", "#b00", 403);

  await markReady(id); // idempotent one-shot + push the buzz to registered devices
  return page(`Order #${o.num} marked READY ✓`, "#ff5500", 200, "The customer's pager is buzzing now.");
}

export async function GET(req: Request, { params }: { params: { id: string } }) { return handle(req, params.id); }
export async function POST(req: Request, { params }: { params: { id: string } }) { return handle(req, params.id); }

function page(title: string, color: string, status: number, sub = ""): Response {
  const html = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
  <body style="margin:0;font-family:system-ui;background:#fffdf9;color:#1c1512;display:grid;place-items:center;min-height:100vh;text-align:center">
  <div><div style="font-size:64px">🍗</div><h1 style="color:${color};margin:8px 0">${title}</h1><p style="color:#666">${sub}</p></div></body>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
