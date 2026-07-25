"use client";
import { useEffect, useState } from "react";

/** Floating arrow that appears once you're a screen deep and shoots back to the top. */
export default function BackToTop() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const onScroll = () => setOn(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button className={`toTop${on ? " on" : ""}`} onClick={toTop} aria-label="Back to top">
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M12 19V6" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}
