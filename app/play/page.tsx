"use client";
import { useEffect, useRef, useState } from "react";

const GAME_SECS = 60;
const LIVES = 3;
const NEST_W = 96;

type EggKind = "white" | "gold" | "rotten";
type Egg = { id: number; x: number; y: number; vy: number; kind: EggKind; rot: number; vrot: number };

type GameState = {
  running: boolean;
  startedAt: number;
  lastFrame: number;
  nextEggAt: number;
  idCounter: number;
  eggs: Egg[];
  nestX: number;
  lives: number;
  score: number;
  caught: number;
};

// Play-while-you-wait egg catcher. Mama drops eggs, you slide the nest to catch them.
// The score POSTs to /api/game/score for loyalty points when the player is signed in;
// guests can still play. If a ?c=CODE is present, we surface the order code below the game.
export default function Play() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef<GameState>({
    running: false, startedAt: 0, lastFrame: 0, nextEggAt: 0, idCounter: 0,
    eggs: [], nestX: 0, lives: LIVES, score: 0, caught: 0,
  });
  const [phase, setPhase] = useState<"idle" | "playing" | "over">("idle");
  const [hud, setHud] = useState({ score: 0, caught: 0, lives: LIVES, remaining: GAME_SECS });
  const [awarded, setAwarded] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    const c = (new URLSearchParams(location.search).get("c") || "").toUpperCase();
    setCode(c);
    const b = Number(localStorage.getItem("tt.best") || 0);
    if (b > 0) setBest(b);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const s = stateRef.current;
      if (!s.running) {
        s.nestX = rect.width / 2;
        drawScene(ctx, rect.width, rect.height, s);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const setNest = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(NEST_W / 2, Math.min(rect.width - NEST_W / 2, clientX - rect.left));
      stateRef.current.nestX = x;
    };
    const onMouse = (e: MouseEvent) => setNest(e.clientX);
    const onTouch = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      setNest(e.touches[0].clientX);
      if (stateRef.current.running) e.preventDefault();
    };
    canvas.addEventListener("mousemove", onMouse);
    canvas.addEventListener("touchstart", onTouch, { passive: false });
    canvas.addEventListener("touchmove", onTouch, { passive: false });

    const keys: Record<string, boolean> = {};
    const kd = (e: KeyboardEvent) => { keys[e.key] = true; };
    const ku = (e: KeyboardEvent) => { keys[e.key] = false; };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    const kbLoop = window.setInterval(() => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      if (keys.ArrowLeft || keys.a || keys.A) s.nestX = Math.max(NEST_W / 2, s.nestX - 14);
      if (keys.ArrowRight || keys.d || keys.D) s.nestX = Math.min(rect.width - NEST_W / 2, s.nestX + 14);
    }, 16);

    return () => {
      canvas.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("touchstart", onTouch);
      canvas.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.clearInterval(kbLoop);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function start() {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const s = stateRef.current;
    s.running = true;
    s.startedAt = performance.now();
    s.lastFrame = s.startedAt;
    s.nextEggAt = s.startedAt + 400;
    s.eggs = [];
    s.nestX = rect.width / 2;
    s.lives = LIVES;
    s.score = 0;
    s.caught = 0;
    setHud({ score: 0, caught: 0, lives: LIVES, remaining: GAME_SECS });
    setAwarded(null);
    setPhase("playing");
    rafRef.current = requestAnimationFrame(loop);
  }

  function loop(now: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    const s = stateRef.current;
    if (!s.running) return;

    const dt = Math.min(0.05, (now - s.lastFrame) / 1000);
    s.lastFrame = now;
    const t = (now - s.startedAt) / 1000;
    const timeLeft = Math.max(0, GAME_SECS - t);

    if (now >= s.nextEggAt) {
      const roll = Math.random();
      const kind: EggKind = roll < 0.09 ? "gold" : roll < 0.28 ? "rotten" : "white";
      s.eggs.push({
        id: ++s.idCounter,
        x: 34 + Math.random() * (rect.width - 68),
        y: -22,
        vy: 150 + Math.random() * 90 + t * 5,
        kind,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 2.2,
      });
      const interval = Math.max(230, 760 - t * 8);
      s.nextEggAt = now + interval;
    }

    const nestY = rect.height - 44;
    for (const egg of s.eggs) { egg.y += egg.vy * dt; egg.rot += egg.vrot * dt; }
    const survivors: Egg[] = [];
    for (const egg of s.eggs) {
      const inBand = egg.y > nestY - 10 && egg.y < nestY + 20;
      const inReach = Math.abs(egg.x - s.nestX) < NEST_W / 2 - 6;
      if (inBand && inReach) {
        if (egg.kind === "white") { s.score += 1; s.caught += 1; }
        else if (egg.kind === "gold") { s.score += 5; s.caught += 5; }
        else if (egg.kind === "rotten") { s.lives -= 1; }
        continue;
      }
      if (egg.y > rect.height + 40) continue;
      survivors.push(egg);
    }
    s.eggs = survivors;

    drawScene(ctx, rect.width, rect.height, s);
    setHud({ score: s.score, caught: s.caught, lives: s.lives, remaining: Math.ceil(timeLeft) });

    if (s.lives <= 0 || timeLeft <= 0) {
      s.running = false;
      finish(s.score, s.caught);
      return;
    }
    rafRef.current = requestAnimationFrame(loop);
  }

  async function finish(score: number, caught: number) {
    setPhase("over");
    try {
      const prev = Number(localStorage.getItem("tt.best") || 0);
      if (score > prev) { localStorage.setItem("tt.best", String(score)); setBest(score); }
      else if (prev > 0) setBest(prev);
    } catch {}
    try {
      const token = typeof window === "undefined" ? null : localStorage.getItem("tt.token");
      if (!token) return;
      const res = await fetch("/api/game/score", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ score, eggs: caught }),
      });
      if (res.ok) {
        const data = await res.json() as { awarded?: number };
        setAwarded(data.awarded ?? 0);
      }
    } catch {}
  }

  return (
    <main style={S.wrap}>
      <div style={S.card}>
        <header style={S.hud}>
          <div style={S.hudCell}><div style={S.hudK}>SCORE</div><div style={S.hudV}>{hud.score}</div></div>
          <div style={S.hudCell}><div style={S.hudK}>EGGS</div><div style={S.hudV}>{hud.caught}</div></div>
          <div style={S.hudCell}><div style={S.hudK}>TIME</div><div style={S.hudV}>{hud.remaining}s</div></div>
          <div style={S.hudCell}>
            <div style={S.hudK}>LIVES</div>
            <div style={S.hudV}>
              {Array.from({ length: LIVES }).map((_, i) => (
                <span key={i} style={{ opacity: i < hud.lives ? 1 : 0.22, color: "#c2570f" }}>♥</span>
              ))}
            </div>
          </div>
        </header>

        <div style={S.stage}>
          <canvas ref={canvasRef} style={S.canvas} aria-label="Egg-catching game" />
          {phase !== "playing" && (
            <div style={S.overlay}>
              {phase === "idle" && (
                <>
                  <div style={S.emoji}>🥚</div>
                  <h1 style={S.h1}>Egg Rush</h1>
                  <p style={S.p}>
                    Catch the eggs Mama's laying. Gold's worth <b>five</b>, rotten <b>costs a life</b>.
                    Sixty seconds. Best score wins loyalty points.
                  </p>
                  {best !== null && <p style={S.best}>Best: {best}</p>}
                  <button onClick={start} style={S.primary}>Play</button>
                  <p style={S.small}>Slide with your finger, mouse, or the arrow keys.</p>
                </>
              )}
              {phase === "over" && (
                <>
                  <div style={S.emoji}>{hud.score >= 60 ? "🐣" : "🥚"}</div>
                  <h1 style={S.h1}>Time's up</h1>
                  <p style={S.p}><b>{hud.caught}</b> eggs · <b>{hud.score}</b> pts</p>
                  {awarded !== null && awarded > 0 && (
                    <p style={S.reward}>+{awarded} loyalty {awarded === 1 ? "point" : "points"}</p>
                  )}
                  {awarded === 0 && (
                    <p style={S.small}>Daily point cap reached — score still counts for your best.</p>
                  )}
                  {best !== null && awarded === null && <p style={S.best}>Best: {best}</p>}
                  <button onClick={start} style={S.primary}>Play again</button>
                </>
              )}
            </div>
          )}
        </div>

        {code ? (
          <p style={S.codeLine}>Your order is cooking — code <b>{code}</b>. We'll buzz you.</p>
        ) : (
          <p style={S.codeLine}>Playing while you wait? Show your ticket code at the counter to save your score.</p>
        )}
      </div>
    </main>
  );
}

function drawScene(ctx: CanvasRenderingContext2D, w: number, h: number, s: GameState) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#ffd390");
  sky.addColorStop(1, "#f7ac54");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(255,253,240,0.55)";
  ctx.beginPath();
  ctx.arc(w * 0.83, 54, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = 0; i < 3; i++) {
    const cx = ((i * 130 + (s.startedAt / 50 || 0)) % (w + 120)) - 60;
    ctx.beginPath();
    ctx.ellipse(cx, 90 + i * 20, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHen(ctx, w / 2, 46);
  for (const egg of s.eggs) drawEgg(ctx, egg);
  drawNest(ctx, s.nestX, h - 34);
}

function drawEgg(ctx: CanvasRenderingContext2D, egg: Egg) {
  ctx.save();
  ctx.translate(egg.x, egg.y);
  ctx.rotate(egg.rot * 0.14);

  ctx.fillStyle = "rgba(0,0,0,0.10)";
  ctx.beginPath();
  ctx.ellipse(0, 22, 11, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  const [fill, stroke] =
    egg.kind === "gold" ? ["#ffd24a", "#a06e10"]
    : egg.kind === "rotten" ? ["#8a9a48", "#3a4416"]
    : ["#fffdf7", "#c99b6c"];

  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (egg.kind === "gold") {
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.ellipse(-3, -6, 2.6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (egg.kind === "rotten") {
    ctx.fillStyle = "rgba(58,68,22,0.4)";
    ctx.beginPath(); ctx.arc(-3, -4, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3, 2, 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-1, 7, 1.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawHen(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "#ff5500";
  ctx.beginPath();
  ctx.moveTo(-38, 2);
  ctx.quadraticCurveTo(-70, -18, -60, -34);
  ctx.quadraticCurveTo(-42, -22, -30, -8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ff7a2e";
  ctx.beginPath();
  ctx.ellipse(0, 0, 42, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.10)";
  ctx.beginPath();
  ctx.ellipse(0, 26, 46, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff8a44";
  ctx.beginPath();
  ctx.arc(38, -10, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e8341b";
  for (const dx of [-6, 4, 12]) {
    ctx.beginPath();
    ctx.arc(32 + dx, -24, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#f4a83a";
  ctx.beginPath();
  ctx.moveTo(52, -8);
  ctx.lineTo(62, -6);
  ctx.lineTo(52, -3);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fffdf9";
  ctx.beginPath(); ctx.arc(42, -12, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1c1512";
  ctx.beginPath(); ctx.arc(43, -12, 1.5, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

function drawNest(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "rgba(0,0,0,0.20)";
  ctx.beginPath();
  ctx.ellipse(0, 26, 56, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#a06a2a";
  ctx.beginPath();
  ctx.ellipse(0, 6, 52, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#7a4a12";
  ctx.lineWidth = 2;
  for (let i = -42; i <= 42; i += 7) {
    ctx.beginPath();
    ctx.moveTo(i, -2);
    ctx.lineTo(i + 5, 14);
    ctx.stroke();
  }

  ctx.strokeStyle = "#6e3408";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, -2, 48, 12, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

const S: Record<string, React.CSSProperties> = {
  wrap: { minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(160deg,#f7d38a,#e3a24a)", fontFamily: "system-ui, -apple-system, sans-serif", padding: 16 },
  card: { width: "100%", maxWidth: 460, background: "#fffdf7", padding: 16, borderRadius: 24, border: "3px solid #6e3408", boxShadow: "0 18px 50px rgba(0,0,0,.25)" },
  hud: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: "6px 4px 10px", borderBottom: "2px dashed rgba(110,52,8,0.25)" },
  hudCell: { textAlign: "center" },
  hudK: { color: "#a06a2a", fontSize: 10, fontWeight: 800, letterSpacing: 1 },
  hudV: { color: "#8a2f0a", fontSize: 20, fontWeight: 900, fontFamily: "ui-monospace, monospace", letterSpacing: 1, minHeight: 24 },
  stage: { position: "relative", marginTop: 12, borderRadius: 18, overflow: "hidden", border: "2px solid #6e3408", background: "#f7ac54" },
  canvas: { display: "block", width: "100%", height: 520, touchAction: "none" },
  overlay: { position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 24, background: "rgba(255,253,247,0.88)", textAlign: "center" },
  emoji: { fontSize: 56, lineHeight: 1, marginBottom: 4 },
  h1: { color: "#8a2f0a", margin: "6px 0 8px", fontSize: 28, fontWeight: 900 },
  p: { color: "#6e3408", fontSize: 15, fontWeight: 600, margin: "0 0 12px", maxWidth: 320 },
  best: { color: "#a06a2a", fontSize: 13, fontWeight: 800, letterSpacing: 1, margin: "0 0 12px" },
  reward: { color: "#0a6a2f", fontSize: 16, fontWeight: 900, margin: "0 0 12px" },
  primary: { background: "#c2570f", color: "#fff", border: "none", padding: "14px 32px", borderRadius: 14, fontSize: 18, fontWeight: 900, cursor: "pointer", boxShadow: "0 6px 0 #8a2f0a" },
  small: { color: "#8a6a3a", fontSize: 12, fontWeight: 600, marginTop: 14, maxWidth: 280 },
  codeLine: { color: "#8a6a3a", fontSize: 12, fontWeight: 700, textAlign: "center", marginTop: 12 },
};
