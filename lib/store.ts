// Account + loyalty persistence.
// Dev: in-memory (survives Next HMR via globalThis). Prod: swap these functions to hit
// Postgres/Supabase using DATABASE_URL and db/schema.sql — the shape is identical.

export type Account = {
  id: string;
  email: string;
  points: number;
  // daily play-to-earn cap tracking
  earnedDay: string; // YYYY-MM-DD (UTC)
  earnedToday: number;
  bestScore: number;
  totalEggs: number;
  createdAt: number;
};

export type Redemption = {
  code: string;
  accountId: string;
  points: number;
  dollars: number;
  createdAt: number;
  usedAt: number | null;
};

type DB = { accounts: Map<string, Account>; byEmail: Map<string, string>; redemptions: Map<string, Redemption> };

const g = globalThis as unknown as { __ttdb?: DB };
const db: DB = g.__ttdb ?? { accounts: new Map(), byEmail: new Map(), redemptions: new Map() };
if (!g.__ttdb) g.__ttdb = db;

function rid(prefix: string): string {
  const bytes = new Uint8Array(9);
  (globalThis.crypto ?? require("node:crypto").webcrypto).getRandomValues(bytes);
  return prefix + Buffer.from(bytes).toString("base64url");
}

export function findByEmail(email: string): Account | undefined {
  const id = db.byEmail.get(email.toLowerCase());
  return id ? db.accounts.get(id) : undefined;
}

export function getAccount(id: string): Account | undefined {
  return db.accounts.get(id);
}

export function createAccount(email: string): Account {
  const existing = findByEmail(email);
  if (existing) return existing;
  const acc: Account = {
    id: rid("acc_"),
    email: email.toLowerCase(),
    points: 0,
    earnedDay: "",
    earnedToday: 0,
    bestScore: 0,
    totalEggs: 0,
    createdAt: Date.now(),
  };
  db.accounts.set(acc.id, acc);
  db.byEmail.set(acc.email, acc.id);
  return acc;
}

export function saveAccount(acc: Account): void {
  db.accounts.set(acc.id, acc);
}

export function createRedemption(r: Redemption): void {
  db.redemptions.set(r.code, r);
}

export function getRedemption(code: string): Redemption | undefined {
  return db.redemptions.get(code);
}
