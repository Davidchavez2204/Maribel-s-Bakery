"use client";

import { MessageCircle, ShieldCheck, ShoppingBag, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { SITE } from "@/config/site";
import { useOrder } from "@/context/OrderContext";
import { formatMoney, hayCotizacion, mensajePedido, totalReferencial, waUrl, type Entrega } from "@/lib/whatsapp";
import { IconoTamano } from "./IconosTamano";
import { Monograma, Sello } from "./Logo";
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
            {/* La tarjeta de agradecimiento de cada caja, ahora con tu nombre (tono de marca). */}
            <figure className={styles.thanks}>
              <Monograma size={40} className={styles.thanksMono} />
              <p className={styles.thanksTitle}>¡Gracias, {o.nombre.trim().split(/\s+/)[0]}!</p>
              <p className={styles.stateText}>
                Tu pedido ya está escrito en WhatsApp. Solo presiona <em>enviar</em> y te confirmo el total y la entrega.
              </p>
              <figcaption className={styles.thanksSign}>Mary</figcaption>
            </figure>
            <a href={waPedido} target="_blank" rel="noopener noreferrer" className={styles.retry}>
              ¿No se abrió WhatsApp? Ábrelo de nuevo
            </a>
            <div className={styles.stateActions}>
              <button type="button" className="btn btn-outline" onClick={() => o.setSent(false)}>
                Volver al pedido
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  o.reset();
                  closeDrawer();
                }}
              >
                Empezar otro pedido
              </button>
            </div>
          </div>
        )}

        {showEmpty && (
          <div className={styles.state}>
            <ShoppingBag size={40} strokeWidth={1.1} color="var(--accent-line)" aria-hidden="true" />
            <p className={styles.emptyTitle}>Tu pedido está vacío</p>
            <p className={styles.stateText}>Presiona «Separar» en los postres de la carta y aparecerán aquí.</p>
            <a href="#productos" className="btn btn-primary" onClick={closeDrawer}>
              Ver la carta
            </a>
          </div>
        )}

        {showCart && (
          <>
            <div className={styles.scroll}>
              <ul className={styles.lines}>
                {lineas.map(({ key, producto: p, opcion: op, qty }) => {
                  const label = op.tamano === "unico" ? p.nombre : `${p.nombre}, ${op.etiqueta.toLowerCase()}`;
                  return (
                    <li key={key} className={styles.line}>
                      <span className={styles.lineName}>
                        {p.nombre}
                        {op.tamano !== "unico" && (
                          <span className={styles.lineSize}>
                            <IconoTamano tamano={op.tamano} size={16} />
                            {op.etiqueta}
                          </span>
                        )}
                      </span>
                      <span className={`${styles.lineSub} tnum`}>
                        {op.precio === null ? "A cotizar" : formatMoney(op.precio * qty)}
                      </span>
                      <div className={styles.lineCtrl}>
                        <Stepper size="sm" qty={qty} label={label} onDec={() => o.setQty(key, qty - 1)} onInc={() => o.setQty(key, qty + 1)} />
                        <span className={styles.lineUnit}>
                          {op.detalle}
                          {op.precio !== null && qty > 1 ? ` · ${formatMoney(op.precio)} c/u` : ""}
                        </span>
                      </div>
                      <button type="button" className={styles.remove} onClick={() => o.setQty(key, 0)} aria-label={`Quitar ${label} del pedido`}>
                        Quitar
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* «Etiqueta de caja» del manual: sello a un lado y líneas para escribir. */}
              <fieldset className={styles.label}>
                <legend className={styles.legend}>Datos para tu caja</legend>
                <Sello id="sello-etiqueta" size={72} className={styles.labelSello} />

                <div className={styles.field}>
                  <label htmlFor="pedido-nombre">¿A nombre de quién?</label>
                  <input
                    id="pedido-nombre"
                    ref={nombreRef}
                    className="input"
                    type="text"
                    name="nombre"
                    autoComplete="name"
                    placeholder="Tu nombre"
                    maxLength={80}
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
                      Escribe tu nombre para saber de quién es el pedido.
                    </span>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="pedido-fecha">¿Para cuándo lo necesitas?</label>
                  <input
                    id="pedido-fecha"
                    className="input"
                    type="date"
                    name="fecha"
                    min={hoyISO()}
                    value={o.fecha}
                    aria-describedby="fecha-ayuda"
                    onChange={(e) => o.setField("fecha", e.target.value)}
                  />
                  <span id="fecha-ayuda" className={styles.hint}>Así lo preparo con tiempo.</span>
                </div>

                <div className={styles.field}>
                  <span id="entrega-label">¿Cómo lo recibes?</span>
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
                    {o.entrega === "recojo" ? `Recojo en ${SITE.direccion}.` : "El costo del delivery lo coordinamos por WhatsApp."}
                  </span>
                </div>

                <div className={styles.field}>
                  <label htmlFor="pedido-notas">¿Algo que deba saber? (opcional)</label>
                  <textarea
                    id="pedido-notas"
                    className="input"
                    name="notas"
                    maxLength={500}
                    rows={2}
                    aria-describedby="notas-ayuda"
                    value={o.notas}
                    onChange={(e) => o.setField("notas", e.target.value)}
                  />
                  <span id="notas-ayuda" className={styles.hint}>Sabor, dedicatoria o alergias.</span>
                </div>
              </fieldset>
            </div>

            <div className={styles.drawerFoot}>
              <div className={styles.totalRow}>
                <span>Total referencial</span>
                <span className={`${styles.total} tnum`}>{formatMoney(total)}</span>
              </div>
              {cotizar && <p className={styles.cotizar}>+ mesa de postres a cotizar</p>}
              <a
                href={waPedido}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-primary ${styles.send}`}
                onClick={onEnviar}
              >
                <MessageCircle size={18} strokeWidth={1.5} aria-hidden="true" />
                Enviar por WhatsApp
              </a>
              <p className={styles.trust}>
                <ShieldCheck size={16} strokeWidth={1.5} color="var(--accent-text)" aria-hidden="true" />
                <span>Aquí no se cobra nada. El pago y la entrega los coordinamos por WhatsApp.</span>
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
