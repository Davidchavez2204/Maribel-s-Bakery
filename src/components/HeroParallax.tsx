"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Parallax de la foto del hero siguiendo el puntero.
 * - No usa estado de React: escribe dos variables CSS (--px, --py) en un requestAnimationFrame,
 *   así mover el mouse nunca re-renderiza el árbol.
 * - Solo en dispositivos con mouse fino y sin «reducir movimiento».
 */
export function HeroParallax({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ok = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!ok.matches) return;

    const hero = el.closest("section") ?? el;
    let frame = 0;
    let tx = 0;
    let ty = 0;

    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      // −0.5 … 0.5 respecto al centro del hero
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!frame) {
        frame = requestAnimationFrame(() => {
          el.style.setProperty("--px", tx.toFixed(3));
          el.style.setProperty("--py", ty.toFixed(3));
          frame = 0;
        });
      }
    };
    const onLeave = () => {
      el.style.setProperty("--px", "0");
      el.style.setProperty("--py", "0");
    };

    hero.addEventListener("pointermove", onMove as EventListener);
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      hero.removeEventListener("pointermove", onMove as EventListener);
      hero.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
