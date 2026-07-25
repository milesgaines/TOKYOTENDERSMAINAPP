"use client";
import { useEffect, useState, useCallback } from "react";

type Item = { name: string; qty: number; flavors?: string[]; sauces?: string[] };
type Order = {
  id: string; num: number; pairCode: string; status: string; customerName: string; customerPhone?: string;
  note?: string; createdAt: number; readyAt: number | null; items: Item[];
};

export default function Kitchen() {
  const [key, setKey] = useState("");
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(Date.now());
  const [err, setErr] = useState("");

  useEffect(() => {
    const saved = new URLSearchParams(location.search).get("key") || localStorage.getItem("tt_staff_key") || "";
    if (saved) { setKey(saved); setReady(true); }
  }, []);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/kitchen?key=${encodeURIComponent(key)}`, { cache: "no-store" });
      if (r.status === 401) { setErr("Wrong staff key"); setReady(false); return; }
      const d = await r.json();
      setOrders(d.orders || []); setErr("");
    } catch { setErr("offline"); }
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    load();
    const a = setInterval(load, 4000);
    const b = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearInterval(a); clearInterval(b); };
  }, [ready, load]);

  async function act(id: string, action: string) {
    if (action !== "ready") setOrders((o) => o.filter((x) => x.id !== id));
    await fetch("/api/kitchen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, id, action }) });
    load();
  }

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [creating, setCreating] = useState(false);
  async function createPager() {
    if (creating) return;
    setCreating(true);
    await fetch("/api/kitchen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, action: "create", name: newName, phone: newPhone }) });
    setNewName(""); setNewPhone(""); setCreating(false); load();
  }

  const mins = (t: number) => {
    const s = Math.max(0, Math.floor((now - t) / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  if (!ready) {
    return (
      <main style={S.gate}>
        <div style={S.gateCard}>
          <div style={{ fontSize: 52 }}>🍗</div>
          <h1 style={S.gateTitle}>Tokyo Tenders — Kitchen</h1>
          <p style={S.gateSub}>Enter the staff key to see live orders.</p>
          <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Staff key" style={S.input} />
          <button onClick={() => { localStorage.setItem("tt_staff_key", key); setReady(true); }} style={S.goBtn}>Open board</button>
          {err && <p style={{ color: "#ff6b6b", fontWeight: 700 }}>{err}</p>}
        </div>
      </main>
    );
  }

  return (
    <main style={S.wrap}>
      <header style={S.head}>
        <div style={S.brand}>🍗 TOKYO TENDERS — KITCHEN</div>
        <div style={S.count}>{orders.length} open{err && <span style={{ color: "#ff6b6b" }}> · {err}</span>}</div>
      </header>
      <div style={S.newBar}>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" style={S.newInput} />
        <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Phone (texts a play link)" style={{ ...S.newInput, flex: 2 }} />
        <button onClick={createPager} disabled={creating} style={S.newBtn}>{creating ? "…" : "+ New pager"}</button>
      </div>
      {orders.length === 0 ? (
        <div style={S.empty}>No open orders. New tickets show up here automatically.</div>
      ) : (
        <div style={S.grid}>
          {orders.map((o) => {
            const isReady = o.status === "ready";
            return (
              <div key={o.id} style={{ ...S.card, borderColor: isReady ? "#22c55e" : "#f0962a", background: isReady ? "#0e2417" : "#1c130a" }}>
                <div style={S.cardTop}>
                  <div style={S.num}>#{o.num}</div>
                  <div style={S.clock}>{mins(o.createdAt)}</div>
                </div>
                <div style={S.name}>{o.customerName}{o.customerPhone ? ` · ${o.customerPhone}` : ""}</div>
                <ul style={S.items}>
                  {o.items.map((it, i) => (
                    <li key={i} style={S.item}>
                      <span style={S.qty}>{it.qty}×</span> {it.name}
                      {it.flavors?.length ? <div style={S.sub}>{it.flavors.join(" · ")}</div> : null}
                      {it.sauces?.length ? <div style={S.sub}>sauce: {it.sauces.join(", ")}</div> : null}
                    </li>
                  ))}
                </ul>
                {o.items.length === 0 && <div style={S.sub}>Order on Toast · pager only</div>}
                {o.note && <div style={S.note}>📝 {o.note}</div>}
                <div style={S.total}>code {o.pairCode}{o.customerPhone ? " · texted" : ""}</div>
                {isReady ? (
                  <button onClick={() => act(o.id, "collected")} style={{ ...S.btn, background: "#166534" }}>PICKED UP ✓</button>
                ) : (
                  <button onClick={() => act(o.id, "ready")} style={{ ...S.btn, background: "#f0962a", color: "#1c130a" }}>MARK READY → BUZZ 🔔</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  gate: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#12100c", fontFamily: "system-ui" },
  gateCard: { textAlign: "center", background: "#1c130a", padding: 32, borderRadius: 20, border: "2px solid #f0962a", maxWidth: 360, display: "grid", gap: 10, placeItems: "center" },
  gateTitle: { color: "#f7d38a", margin: 0, fontSize: 22 },
  gateSub: { color: "#c9a26a", margin: 0, fontSize: 14 },
  input: { padding: "12px 14px", borderRadius: 12, border: "2px solid #6e3408", background: "#fff8ea", fontSize: 16, width: "100%", boxSizing: "border-box" },
  goBtn: { padding: "12px 20px", borderRadius: 12, border: "none", background: "#f0962a", color: "#1c130a", fontWeight: 900, fontSize: 16, cursor: "pointer", width: "100%" },
  wrap: { minHeight: "100vh", background: "#12100c", fontFamily: "system-ui", padding: 16 },
  head: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, position: "sticky", top: 0 },
  brand: { color: "#f7d38a", fontWeight: 900, fontSize: 20, letterSpacing: 1 },
  count: { color: "#c9a26a", fontWeight: 800, fontSize: 15 },
  newBar: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  newInput: { flex: 1, minWidth: 120, padding: "10px 12px", borderRadius: 10, border: "1px solid #6e3408", background: "#1c130a", color: "#f7d38a", fontSize: 15, fontWeight: 600 },
  newBtn: { padding: "10px 18px", borderRadius: 10, border: "none", background: "#f0962a", color: "#1c130a", fontWeight: 900, fontSize: 15, cursor: "pointer" },
  empty: { color: "#8a6a3a", textAlign: "center", marginTop: 80, fontSize: 16 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 },
  card: { border: "2px solid", borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", gap: 8 },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  num: { color: "#fff", fontWeight: 900, fontSize: 30 },
  clock: { color: "#f0962a", fontWeight: 800, fontVariantNumeric: "tabular-nums", fontSize: 16 },
  name: { color: "#f7d38a", fontWeight: 800, fontSize: 15 },
  items: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 },
  item: { color: "#eae0d0", fontSize: 15, fontWeight: 600 },
  qty: { color: "#f0962a", fontWeight: 900 },
  sub: { color: "#b79a6f", fontSize: 12, marginLeft: 20, fontWeight: 600 },
  note: { color: "#ffd36b", fontSize: 13, fontWeight: 700, background: "#2a1e0d", padding: "6px 8px", borderRadius: 8 },
  total: { color: "#c9a26a", fontWeight: 800, fontSize: 14 },
  btn: { marginTop: 4, padding: "14px 10px", borderRadius: 12, border: "none", fontWeight: 900, fontSize: 15, color: "#fff", cursor: "pointer" },
};
