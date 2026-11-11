"use client";

import { MessageCircle, Minus, Plus } from "lucide-react";
import type { MouseEvent } from "react";
import { SITE } from "@/config/site";
import { useOrder } from "@/context/OrderContext";
import { CATEGORIAS, clave, PRODUCTOS, type Opcion, type Producto } from "@/data/productos";
import { reveal } from "@/lib/reveal";
import { flyToCart } from "@/lib/flyToCart";
import { formatMoney, WA_CATERING } from "@/lib/whatsapp";
import { IconoTamano } from "./IconosTamano";
import { Plate } from "./Plate";
import { Stepper } from "./Stepper";
import styles from "./Catalog.module.css";

function precioTexto(o: Opcion): string {
  if (o.precio === null) return "A cotizar";
  return SITE.mostrarPrecios ? formatMoney(o.precio) : "Consultar";
}

/** Nombre accesible de un tamaño: «Torta de chocolate, media (6 porciones)». */
const nombreOpcion = (p: Producto, o: Opcion) =>
  o.tamano === "unico" ? p.nombre : `${p.nombre}, ${o.etiqueta.toLowerCase()} (${o.detalle})`;

/** Acción de la mesa de postres: «Separar» o, si ya está en el pedido, su control de cantidad. */
function OpcionAction({ p, o }: { p: Producto; o: Opcion }) {
  const { cart, add, setQty } = useOrder();
  const key = clave(p.id, o.tamano);
  const qty = cart[key] ?? 0;
  const label = nombreOpcion(p, o);
  if (qty > 0) {
    return (
      <Stepper
        qty={qty}
        label={label}
        onDec={() => setQty(key, qty - 1)}
        onInc={(e) => {
          add(key);
          flyToCart(e.currentTarget);
        }}
      />
    );
  }
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    add(key);
    flyToCart(e.currentTarget);
  };
  return (
    <button type="button" className="btn btn-outline btn-sm" onClick={onClick} aria-label={`Separar ${label}`}>
      <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
      Separar
    </button>
  );
}

/**
 * Precios escalonados en UNA fila: tres bloques tocables (entera → media → porción).
 * El «bajar de nivel» se lee de izquierda a derecha: cada bloque es más bajo y su precio más chico.
 * Tocar un bloque agrega ese tamaño; si ya está en el pedido muestra la cantidad y un «−».
 * (El detalle de cantidades por línea vive en el panel del pedido.)
 */
function Niveles({ p }: { p: Producto }) {
  const { cart, add, setQty } = useOrder();
  return (
    <ul className={styles.tiers} aria-label={`Tamaños y precios de ${p.nombre}`}>
      {p.opciones.map((o, i) => {
        const key = clave(p.id, o.tamano);
        const qty = cart[key] ?? 0;
        const label = nombreOpcion(p, o);
        return (
          <li key={o.tamano} className={styles.tier} data-nivel={i + 1} data-activo={qty > 0 || undefined}>
            <button
              type="button"
              className={styles.tierBtn}
              aria-label={`Agregar ${label}, ${precioTexto(o)}${qty > 0 ? `. En tu pedido: ${qty}` : ""}`}
              onClick={(e) => {
                add(key);
                flyToCart(e.currentTarget);
              }}
            >
              <IconoTamano tamano={o.tamano} className={styles.tierIcon} />
              <span className={`${styles.tierPrice} tnum`}>{precioTexto(o)}</span>
              <span className={styles.tierLabel}>{o.etiqueta}</span>
              <span className={styles.tierDetail}>{o.detalle}</span>
              {qty === 0 ? (
                <Plus size={14} strokeWidth={1.75} className={styles.tierPlus} aria-hidden="true" />
              ) : (
                <span className={`${styles.tierQty} tnum`} aria-hidden="true">{qty}</span>
              )}
            </button>
            {qty > 0 && (
              <button
                type="button"
                className={styles.tierMinus}
                aria-label={`Quitar uno de ${label}`}
                onClick={() => setQty(key, qty - 1)}
              >
                <Minus size={14} strokeWidth={1.75} aria-hidden="true" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Sello «separado» sobre la foto: feedback de que el postre ya está en tu pedido,
 * como el sticker que cierra las cajas. Suma todos los tamaños. Decorativo para
 * lectores de pantalla (la cantidad ya la anuncia cada control).
 */
function Stamp({ qty }: { qty: number }) {
  if (qty === 0) return null;
  return (
    <span className={styles.stamp} aria-hidden="true">
      <span className={`${styles.stampQty} tnum`}>×{qty}</span>
      <span className={styles.stampLabel}>separado</span>
    </span>
  );
}

function ProductCard({ p, index }: { p: Producto; index: number }) {
  const { qtyProducto } = useOrder();
  return (
    <article className={styles.card} aria-labelledby={`prod-${p.id}`} style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
      <div className={styles.media}>
        <Plate src={p.foto} alt={p.nombre} ratio="4 / 5" sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 400px" />
        <Stamp qty={qtyProducto(p.id)} />
      </div>
      <div className={styles.body}>
        <h3 id={`prod-${p.id}`} className={styles.name}>{p.nombre}</h3>
        <p className={styles.desc}>{p.desc}</p>
      </div>
      <Niveles p={p} />
    </article>
  );
}

/** Mesa de postres: pieza ancha que rompe el ritmo de la grilla, con su propio llamado. */
function FeatureCard({ p }: { p: Producto }) {
  const { qtyProducto } = useOrder();
  const o = p.opciones[0];
  if (!o) return null;
  return (
    <article className={styles.feature} aria-labelledby={`prod-${p.id}`}>
      <div className={styles.featureMedia}>
        <Plate src={p.foto} alt={p.nombre} ratio="4 / 3" sizes="(max-width: 900px) 100vw, 620px" />
        <Stamp qty={qtyProducto(p.id)} />
      </div>
      <div className={styles.featureBody}>
        <p className={styles.featureKicker}>Por encargo</p>
        <h3 id={`prod-${p.id}`} className={styles.featureName}>{p.nombre}</h3>
        <p className={styles.featureDesc}>{p.desc}</p>
        <p className={styles.unit}>{precioTexto(o)}, {o.detalle.toLowerCase()}</p>
        <div className={styles.featureActions}>
          <OpcionAction p={p} o={o} />
          <a href={WA_CATERING} target="_blank" rel="noopener noreferrer" className={styles.textLink}>
            <MessageCircle size={16} strokeWidth={1.5} aria-hidden="true" />
            Cotizar mi evento
          </a>
        </div>
      </div>
    </article>
  );
}

export function Catalog() {
  const { filtro, setFiltro } = useOrder();
  const visibles = filtro === "todos" ? PRODUCTOS : PRODUCTOS.filter((p) => p.cat === filtro);
  const normales = visibles.filter((p) => p.cat !== "catering");
  const destacados = visibles.filter((p) => p.cat === "catering");

  return (
    <section id="productos" className={styles.section} aria-labelledby="productos-title">
      <div className={`container ${styles.head}`} {...reveal(0)}>
        <h2 id="productos-title" className={styles.h2}>La carta</h2>
        <p className={styles.intro}>
          Todo lo preparo por encargo: pide la torta entera, la mitad o por porciones. Los precios son referenciales
          y el total te lo confirmo por WhatsApp.
        </p>
      </div>

      {/* Barra de categorías fija bajo el header (patrón de tienda de la referencia). */}
      <div className={styles.filterBar}>
        <div className={`container ${styles.filterInner}`}>
          <div className={styles.chips} role="group" aria-label="Filtrar la carta por categoría">
            {CATEGORIAS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={styles.chip}
                aria-pressed={filtro === c.id}
                onClick={() => setFiltro(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <p className={`${styles.count} tnum`} aria-live="polite">
            {visibles.length} {visibles.length === 1 ? "postre" : "postres"}
          </p>
        </div>
      </div>

      <div className={`container ${styles.gridWrap}`}>
        {normales.length > 0 && (
          <div className={styles.grid} key={filtro}>
            {normales.map((p, i) => (
              <ProductCard key={p.id} p={p} index={i} />
            ))}
          </div>
        )}
        {destacados.map((p) => (
          <FeatureCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}
