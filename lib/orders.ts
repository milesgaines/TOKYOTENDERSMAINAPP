// Real orders. Dev: in-memory (globalThis, survives HMR). PROD: swap these bodies to Vercel KV /
// Supabase — the FUNCTION SHAPES are the drop-in contract (on Vercel the phone's poll and the
// kitchen's ready-tap hit different lambdas, so the in-memory Map does NOT work in prod).
import crypto from "node:crypto";

export type OrderStatus = "new" | "cooking" | "ready" | "collected" | "canceled";

export type OrderItem = {
  key: string;
  name: string;
  detail?: string;
  flavors?: string[];
  sauces?: string[];
  unitCents: number;
  qty: number;
};

export type Order = {
  id: string;
  num: number;               // human ticket number (40+seq)
  pairCode: string;          // short code the SMS/deep-link carries to pair the app to this order
  accountId: string | null;  // null = guest (the id itself is the capability)
  items?: OrderItem[];       // optional — the order lives on Toast; the app only pages
  customerName: string;
  customerPhone?: string;
  note?: string;
  status: OrderStatus;
  readyToken: string;        // unguessable — the magic-link auth
  source: "toast" | "staff" | "square";
  externalId?: string | null; // Toast/Square order id, when integrated
  createdAt: number;
  readyAt: number | null;
};

type DB = { orders: Map<string, Order>; pair: Map<string, string>; ext: Map<string, string>; seq: number };
const g = globalThis as unknown as { __ttorders?: DB };
const db: DB = g.__ttorders ?? { orders: new Map(), pair: new Map(), ext: new Map(), seq: 0 };
db.pair ??= new Map();  // tolerate an older globalThis shape across HMR/redeploys
db.ext ??= new Map();
if (!g.__ttorders) g.__ttorders = db;

export function rid(prefix: string): string {
  return prefix + crypto.randomBytes(9).toString("base64url");
}

export function nextTicketNum(): number {
  db.seq += 1;
  return 40 + (db.seq % 460); // 40..499, rolls over
}

// Short, unambiguous pair code (no 0/O/1/I) — easy to read off a text or receipt.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export function nextPairCode(): string {
  for (let tries = 0; tries < 40; tries++) {
    const b = crypto.randomBytes(4);
    let code = "";
    for (let i = 0; i < 4; i++) code += ALPHABET[b[i] % ALPHABET.length];
    if (!db.pair.has(code)) return code;
  }
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function createOrder(o: Order): Promise<Order> {
  db.orders.set(o.id, o);
  db.pair.set(o.pairCode, o.id);
  if (o.externalId) db.ext.set(o.externalId, o.id);
  return o;
}

export async function getOrder(id: string): Promise<Order | undefined> {
  return db.orders.get(id);
}

export async function getOrderByPairCode(code: string): Promise<Order | undefined> {
  const id = db.pair.get(code.toUpperCase());
  return id ? db.orders.get(id) : undefined;
}

/** Idempotency for external POS webhooks (Toast/Square order GUID). */
export async function getOrderByExternalId(externalId: string): Promise<Order | undefined> {
  const id = db.ext.get(externalId);
  return id ? db.orders.get(id) : undefined;
}

export async function listOpen(): Promise<Order[]> {
  return [...db.orders.values()]
    .filter((o) => o.status === "new" || o.status === "cooking" || o.status === "ready")
    .sort((a, b) => a.createdAt - b.createdAt);
}

/** Idempotent status set; stamps readyAt once when it first becomes ready. */
export async function setOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
  const o = db.orders.get(id);
  if (!o) return undefined;
  if (status === "ready" && o.status === "ready") return o; // one-shot
  o.status = status;
  if (status === "ready" && !o.readyAt) o.readyAt = Date.now();
  db.orders.set(id, o);
  return o;
}
