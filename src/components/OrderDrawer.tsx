"use client";

import { Check, MessageCircle, ShieldCheck, ShoppingBag, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { SITE } from "@/config/site";
import { useOrder } from "@/context/OrderContext";
import { formatMoney, hayCotizacion, mensajePedido, totalReferencial, waUrl, type Entrega } from "@/lib/whatsapp";
import { Stepper } from "./Stepper";
import styles from "./OrderUI.module.css";

const ENTREGAS: { id: Entrega; label: string }[] = [
  { id: "recojo", label: "Recojo" },
  { id: "delivery", label: "Delivery" },
];

/** Fecha local de hoy en formato yyyy-mm-dd (para el `min` del input date). */
function hoyISO(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export function OrderDrawer() {
  const o = useOrder();
  const { open, closeDrawer, lineas, count, sent } = o;
  const [nombreError, setNombreError] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const nombreRef = useRef<HTMLInputElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const total = totalReferencial(lineas);
  const cotizar = hayCotizacion(lineas);
  const waPedido = useMemo(
    () => waUrl(mensajePedido(lineas, { nombre: o.nombre, fecha: o.fecha, entrega: o.entrega, notas: o.notas })),
    [lineas, o.nombre, o.fecha, o.entrega, o.notas],
  );

  // Gestión de foco + Escape + bloqueo de scroll del fondo (comportamiento de diálogo modal).
  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
      if (e.key !== "Tab" || !panelRef.current) return;
      // Trampa de foco: Tab no se escapa del panel mientras está abierto.
      const f = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = f[0];
      const last = f[f.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lastFocus.current?.focus?.();
    };
  }, [open, closeDrawer]);

  /**
   * El botón de envío es un <a> real (no window.open): los bloqueadores de pop-ups
   * nunca bloquean un clic en un enlace y funciona igual en iOS/Android.
   */
  const onEnviar = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!o.nombre.trim()) {
      e.preventDefault();
      setNombreError(true);
      nombreRef.current?.focus();
      return;
    }
    o.setSent(true);
  };

  const showSent = sent;
  const showEmpty = !sent && count === 0;
  const showCart = !sent && count > 0;

  return (
    <>
      <div className={`${styles.backdrop} ${open ? styles.backdropShown : ""}`} onClick={closeDrawer} aria-hidden="true" />
      <aside
        id="pedido-drawer"
        ref={panelRef}
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pedido-title"
        inert={!open}
      >
        <div className={styles.drawerHead}>
          <h2 id="pedido-title" className={styles.drawerTitle}>Tu pedido</h2>
          <button ref={closeBtnRef} type="button" className="btn btn-ghost btn-icon" aria-label="Cerrar" onClick={closeDrawer}>
            <X size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        {showSent && (
          <div className={styles.state}>
            <div className={styles.checkCircle}>
              <Check size={34} strokeWidth={1.5} color="var(--color-accent-700)" aria-hidden="true" />
            </div>
            <p className={styles.stateTitle}>Tu pedido está listo en WhatsApp</p>
            <p className={styles.stateText}>
              Solo presiona <em>enviar</em> en WhatsApp. Maribel te responderá para confirmar el total y la entrega.
            </p>
            <a href={waPedido} target="_blank" rel="noopener noreferrer" className={styles.retry}>
              ¿No se abrió? Abrir WhatsApp de nuevo
            </a>
            <div className={styles.stateActions}>
              <button type="button" className="btn btn-secondary" style={{ padding: "10px 18px" }} onClick={() => o.setSent(false)}>
                Volver al pedido
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: "10px 18px" }}
                onClick={() => {
                  o.reset();
                  closeDrawer();
                }}
              >
                Empezar uno nuevo
              </button>
            </div>
          </div>
        )}

        {showEmpty && (
          <div className={styles.state}>
            <ShoppingBag size={44} strokeWidth={1.1} color="var(--color-accent)" aria-hidden="true" />
            <p className={styles.emptyTitle}>Aún no separas nada</p>
            <p className={styles.stateText}>Elige tus postres en la carta y aparecerán aquí.</p>
            <a href="#productos" className="btn btn-primary" style={{ padding: "10px 20px", marginTop: 6 }} onClick={closeDrawer}>
              Ver productos
            </a>
          </div>
        )}

        {showCart && (
          <>
            <div className={styles.scroll}>
              <ul className={styles.lines}>
                {lineas.map(({ producto: p, qty }) => (
                  <li key={p.id} className={styles.line}>
                    <span className={styles.lineName}>{p.nombre}</span>
                    <span className={`${styles.lineSub} tnum`}>
                      {p.precio === null ? "A cotizar" : formatMoney(p.precio * qty)}
                    </span>
                    <div className={styles.lineCtrl}>
                      <Stepper size="sm" qty={qty} label={p.nombre} onDec={() => o.setQty(p.id, qty - 1)} onInc={() => o.setQty(p.id, qty + 1)} />
                      <span className={styles.lineUnit}>{p.unidad}</span>
                    </div>
                    <button type="button" className={styles.remove} onClick={() => o.setQty(p.id, 0)} aria-label={`Quitar ${p.nombre} del pedido`}>
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>

              <fieldset className={styles.form}>
                <legend className={styles.legend}>Tus datos</legend>

                <label className={styles.field}>
                  Nombre
                  <input
                    ref={nombreRef}
                    className="input"
                    type="text"
                    name="nombre"
                    autoComplete="name"
                    maxLength={80}
                    placeholder="¿A nombre de quién?"
                    value={o.nombre}
                    aria-invalid={nombreError}
                    aria-describedby={nombreError ? "nombre-error" : undefined}
                    required
                    onChange={(e) => {
                      o.setField("nombre", e.target.value);
                      if (nombreError) setNombreError(false);
                    }}
                  />
                  {nombreError && (
                    <span id="nombre-error" className={styles.error} role="alert">
                      Escribe tu nombre para que Maribel sepa de quién es el pedido.
                    </span>
                  )}
                </label>

                <label className={styles.field}>
                  ¿Para qué fecha?
                  <input
                    className="input"
                    type="date"
                    name="fecha"
                    min={hoyISO()}
                    value={o.fecha}
                    onChange={(e) => o.setField("fecha", e.target.value)}
                  />
                </label>

                <div className={styles.field}>
                  <span id="entrega-label">Entrega</span>
                  <div className={styles.segmented} role="radiogroup" aria-labelledby="entrega-label">
                    {ENTREGAS.map((en) => (
                      <button
                        key={en.id}
                        type="button"
                        role="radio"
                        aria-checked={o.entrega === en.id}
                        className={styles.segOpt}
                        onClick={() => o.setEntrega(en.id)}
                      >
                        {en.label}
                      </button>
                    ))}
                  </div>
                  <span className={styles.hint}>
                    {o.entrega === "recojo" ? `Recojo en ${SITE.direccion}` : "El costo del delivery se coordina por WhatsApp."}
                  </span>
                </div>

                <label className={styles.field}>
                  Notas (opcional)
                  <textarea
                    className="input"
                    name="notas"
                    maxLength={500}
                    placeholder="Sabor, dedicatoria, alergias…"
                    value={o.notas}
                    onChange={(e) => o.setField("notas", e.target.value)}
                  />
                </label>
              </fieldset>
            </div>

            <div className={styles.drawerFoot}>
              <div className={styles.totalRow}>
                <span>Total referencial</span>
                <span className={`${styles.total} tnum`}>{formatMoney(total)}</span>
              </div>
              {cotizar && <p className={styles.cotizar}>+ catering a cotizar</p>}
              <a
                href={waPedido}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-primary ${styles.send}`}
                onClick={onEnviar}
              >
                <MessageCircle size={18} strokeWidth={1.5} aria-hidden="true" />
                Enviar pedido por WhatsApp
              </a>
              <p className={styles.trust}>
                <ShieldCheck size={16} strokeWidth={1.5} color="var(--color-accent-700)" aria-hidden="true" />
                <span>No se cobra nada en esta página. El pago y la entrega se coordinan directamente con Maribel.</span>
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
