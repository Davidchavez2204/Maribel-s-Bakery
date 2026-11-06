import type { CSSProperties } from "react";

/**
 * Marca un elemento para animarse al entrar en pantalla.
 * Uso: <div {...reveal(120)}>…</div>
 * La animación la ejecuta <RevealObserver /> con un único IntersectionObserver.
 */
export function reveal(delayMs = 0): { "data-reveal": ""; style: CSSProperties } {
  return { "data-reveal": "", style: { "--reveal-delay": `${delayMs}ms` } as CSSProperties };
}
