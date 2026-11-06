"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { SITE } from "@/config/site";
import { useOrder } from "@/context/OrderContext";
import { CATEGORIAS, CATEGORIA_LABEL, PRODUCTOS, type Filtro, type Producto } from "@/data/productos";
import { reveal } from "@/lib/reveal";
import { formatMoney } from "@/lib/whatsapp";
import { Plate } from "./Plate";
import { Stepper } from "./Stepper";
import styles from "./Catalog.module.css";

function precioTexto(p: Producto): string {
  if (p.precio === null) return "A cotizar";
  return SITE.mostrarPrecios ? formatMoney(p.precio) : "Consultar";
}

function ProductCard({ p }: { p: Producto }) {
  const { cart, add, setQty } = useOrder();
  const qty = cart[p.id] ?? 0;

  return (
    <article className={styles.card} aria-labelledby={`prod-${p.id}`}>
      <Plate src={p.foto} alt={p.nombre} ratio="1 / 1" sizes="(max-width: 640px) 100vw, (max-width: 1180px) 50vw, 360px" />
      <div className={styles.body}>
        <p className={styles.cat}>{CATEGORIA_LABEL[p.cat]}</p>
        <h3 id={`prod-${p.id}`} className={styles.name}>{p.nombre}</h3>
        <p className={styles.desc}>{p.desc}</p>
      </div>
      <div className={styles.foot}>
        <div className={styles.price}>
          <span className={`${styles.amount} tnum`}>{precioTexto(p)}</span>
          <span className={styles.unit}>{p.unidad}</span>
        </div>
        {qty > 0 ? (
          <Stepper qty={qty} label={p.nombre} onDec={() => setQty(p.id, qty - 1)} onInc={() => add(p.id)} />
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => add(p.id)} aria-label={`Separar ${p.nombre}`}>
            <Plus size={15} strokeWidth={1.6} aria-hidden="true" />
            Separar
          </button>
        )}
      </div>
    </article>
  );
}

export function Catalog() {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const visibles = filtro === "todos" ? PRODUCTOS : PRODUCTOS.filter((p) => p.cat === filtro);

  return (
    <section id="productos" className={`container ${styles.section}`} aria-labelledby="productos-title">
      <div className={styles.head} {...reveal(0)}>
        <div className={styles.titles}>
          <p className="kicker">La carta</p>
          <h2 id="productos-title" className={styles.h2}>Lo que preparamos</h2>
        </div>
        <div className={styles.chips} role="group" aria-label="Filtrar por categoría">
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
      </div>

      <div className={styles.grid}>
        {visibles.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

      <p className={styles.note} {...reveal(0)}>
        Precios referenciales en soles. El total final se confirma por WhatsApp según tamaño, sabor y decoración.
      </p>
    </section>
  );
}
