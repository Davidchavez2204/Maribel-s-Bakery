/**
 * Hace «volar» un pequeño sello desde el botón pulsado hasta el contador del carrito.
 * Feedback espacial: el usuario ve a dónde fue su postre.
 * - Web Animations API (sin librerías, sin estado de React) y limpieza automática.
 * - No hace nada con «reducir movimiento» o si el destino no es visible.
 */
export function flyToCart(origin: Element | null): void {
  if (typeof window === "undefined" || !origin) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // El primer destino visible: contador del header (o la barra flotante si ya está abierta).
  const target = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]")).find(
    (el) => el.getClientRects().length > 0,
  );
  if (!target || typeof origin.animate !== "function") return;

  const a = origin.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const size = 34;
  const x0 = a.left + a.width / 2 - size / 2;
  const y0 = a.top + a.height / 2 - size / 2;
  const dx = b.left + b.width / 2 - size / 2 - x0;
  const dy = b.top + b.height / 2 - size / 2 - y0;

  const dot = document.createElement("span");
  dot.className = "fly-dot";
  dot.setAttribute("aria-hidden", "true");
  dot.textContent = "M";
  Object.assign(dot.style, { left: `${x0}px`, top: `${y0}px`, width: `${size}px`, height: `${size}px` });
  document.body.appendChild(dot);

  // Arco: sube primero y luego cae sobre el carrito, encogiéndose.
  const anim = dot.animate(
    [
      { transform: "translate(0, 0) scale(0.6)", opacity: 0 },
      { transform: `translate(${dx * 0.3}px, ${dy * 0.3 - 90}px) scale(1.15)`, opacity: 1, offset: 0.35 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.45)`, opacity: 0.9 },
    ],
    { duration: 720, easing: "cubic-bezier(0.5, 0, 0.3, 1)" },
  );
  const cleanup = () => dot.remove();
  anim.onfinish = cleanup;
  anim.oncancel = cleanup;
}
