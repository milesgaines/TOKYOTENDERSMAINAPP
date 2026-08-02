"use client";
import { useEffect, useState } from "react";

// The link in the customer's text lands here. If the app is installed, the button opens it straight
// to their order (via the tokyotenders:// deep link). If not, it points them to install, then they
// enter the code. APP_STORE_URL gets filled in once the app is live on TestFlight/the App Store.
const APP_STORE_URL = "https://apps.apple.com/app/tokyo-tenders";

export default function Play() {
  const [code, setCode] = useState("");

  useEffect(() => {
    const c = (new URLSearchParams(location.search).get("c") || "").toUpperCase();
    setCode(c);
    if (c) { // try to bounce straight into the app
      const t = setTimeout(() => { window.location.href = `tokyotenders://pair?c=${c}`; }, 250);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <main style={S.wrap}>
      <div style={S.card}>
        <div style={{ fontSize: 72 }}>🍗</div>
        <h1 style={S.h1}>Your tenders are cooking!</h1>
        <p style={S.p}>Play our egg game while you wait — your phone buzzes the second your food is ready.</p>
        {code && (
          <div style={S.codeBox}>
            <div style={S.codeLabel}>YOUR ORDER CODE</div>
            <div style={S.code}>{code}</div>
          </div>
        )}
        <a href={code ? `tokyotenders://pair?c=${code}` : "tokyotenders://"} style={S.primary}>Open the game 🎮</a>
        <a href={APP_STORE_URL} style={S.secondary}>Get the app</a>
        <p style={S.small}>Already installed? Tap “Open the game.” New here? Get the app, then enter code <b>{code || "—"}</b> (or your ticket # from the receipt) on the Order screen.</p>
      </div>
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(160deg,#f7d38a,#e3a24a)", fontFamily: "system-ui", padding: 20 },
  card: { textAlign: "center", background: "#fffdf7", padding: "32px 26px", borderRadius: 24, border: "3px solid #6e3408", maxWidth: 380, width: "100%", boxShadow: "0 18px 50px rgba(0,0,0,.25)" },
  h1: { color: "#8a2f0a", margin: "6px 0 4px", fontSize: 26, fontWeight: 900 },
  p: { color: "#6e3408", fontSize: 15, fontWeight: 600, margin: "0 0 18px" },
  codeBox: { background: "#fff4dc", border: "2px dashed #e0791b", borderRadius: 14, padding: "10px 0", margin: "0 0 18px" },
  codeLabel: { color: "#a06a2a", fontSize: 11, fontWeight: 800, letterSpacing: 1 },
  code: { color: "#c2570f", fontSize: 34, fontWeight: 900, fontFamily: "ui-monospace,monospace", letterSpacing: 4 },
  primary: { display: "block", background: "#c2570f", color: "#fff", textDecoration: "none", padding: "16px", borderRadius: 14, fontSize: 18, fontWeight: 900, marginBottom: 10 },
  secondary: { display: "block", background: "#fff", color: "#c2570f", textDecoration: "none", padding: "14px", borderRadius: 14, fontSize: 16, fontWeight: 800, border: "2px solid #c2570f" },
  small: { color: "#8a6a3a", fontSize: 12, fontWeight: 600, marginTop: 16, marginBottom: 0 },
};
