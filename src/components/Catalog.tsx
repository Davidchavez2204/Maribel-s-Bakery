"use client";

import { MessageCircle, Plus } from "lucide-react";
import { SITE } from "@/config/site";
import { useOrder } from "@/context/OrderContext";
import { CATEGORIAS, PRODUCTOS, type Producto } from "@/data/productos";
import { reveal } from "@/lib/reveal";
import { flyToCart } from "@/lib/flyToCart";
import { formatMoney, WA_CATERING } from "@/lib/whatsapp";
import { Plate } from "./Plate";
import { Stepper } from "./Stepper";
import styles from "./Catalog.module.css";

function precioTexto(p: Producto): string {
  if (p.precio === null) return "A cotizar";
  return SITE.mostrarPrecios ? formatMoney(p.precio) : "Consultar";
}

/** Acción de la tarjeta: «Separar» o, si ya está en el pedido, el control de cantidad. */
function CardAction({ p, full }: { p: Producto; full?: boolean }) {
  const { cart, add, setQty } = useOrder();
  const qty = cart[p.id] ?? 0;
  if (qty > 0) {
    return (
      <Stepper
        qty={qty}
        label={p.nombre}
        onDec={() => setQty(p.id, qty - 1)}
        onInc={(e) => {
          add(p.id);
          flyToCart(e.currentTarget);
        }}
      />
    );
  }
  return (
    <button
      type="button"
      className={`btn btn-outline btn-sm ${full ? styles.actionFull : ""}`}
      onClick={(e) => {
        add(p.id);
        flyToCart(e.currentTarget);
      }}
      aria-label={`Separar ${p.nombre}`}
    >
      <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
      Separar
    </button>
  );
}

/**
 * Sello «separado» sobre la foto: feedback de que el postre ya está en tu pedido,
 * como el sticker que cierra las cajas. Decorativo para lectores de pantalla
 * (la cantidad ya la anuncia el control).
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
  const { cart } = useOrder();
  return (
    <article className={styles.card} aria-labelledby={`prod-${p.id}`} style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
      <div className={styles.media}>
        <Plate src={p.foto} alt={p.nombre} ratio="4 / 5" sizes="(max-width: 640px) 50vw, (max-width: 1240px) 33vw, 400px" />
        <Stamp qty={cart[p.id] ?? 0} />
      </div>
      <div className={styles.body}>
        <h3 id={`prod-${p.id}`} className={styles.name}>{p.nombre}</h3>
        <p className={styles.desc}>{p.desc}</p>
      </div>
      <div className={styles.foot}>
        <p className={styles.price}>
          <span className={`${styles.amount} tnum`}>{precioTexto(p)}</span>
          <span className={styles.unit}>{p.unidad}</span>
        </p>
        <CardAction p={p} full />
      </div>
    </article>
  );
}

/** Mesa de postres: pieza ancha que rompe el ritmo de la grilla, con su propio llamado. */
function FeatureCard({ p }: { p: Producto }) {
  const { cart } = useOrder();
  return (
    <article className={styles.feature} aria-labelledby={`prod-${p.id}`}>
      <div className={styles.featureMedia}>
        <Plate src={p.foto} alt={p.nombre} ratio="3 / 2" sizes="(max-width: 900px) 100vw, 620px" />
        <Stamp qty={cart[p.id] ?? 0} />
      </div>
      <div className={styles.featureBody}>
        <p className={styles.featureKicker}>Por encargo</p>
        <h3 id={`prod-${p.id}`} className={styles.featureName}>{p.nombre}</h3>
        <p className={styles.featureDesc}>{p.desc}</p>
        <p className={styles.unit}>{precioTexto(p)}, {p.unidad.toLowerCase()}</p>
        <div className={styles.featureActions}>
          <CardAction p={p} />
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
          Todo lo preparo por encargo. Los precios son referenciales: el total te lo confirmo por WhatsApp según
          tamaño, sabor y decoración.
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
