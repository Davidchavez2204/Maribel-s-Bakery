"use client";

import { ShoppingBag } from "lucide-react";
import { useOrder } from "@/context/OrderContext";
import { Brand } from "./Brand";
import styles from "./Header.module.css";

export function Header() {
  const { count, bump, openDrawer } = useOrder();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <a href="#inicio" className={styles.brandLink} aria-label="Maribel's Bakery, ir al inicio">
          <Brand />
        </a>
        <nav aria-label="Principal" className={styles.nav}>
          <a href="#productos">Productos</a>
          <a href="#como-pedir">Cómo pedir</a>
          <a href="#contacto">Contacto</a>
        </nav>
        <button
          type="button"
          className={`btn btn-primary ${styles.cartBtn}`}
          onClick={openDrawer}
          aria-haspopup="dialog"
          aria-controls="pedido-drawer"
        >
          <ShoppingBag size={18} strokeWidth={1.5} aria-hidden="true" />
          <span className={styles.cartLabel}>Mi pedido</span>
          <span className={`${styles.badge} tnum`} style={{ transform: `scale(${bump ? 1.35 : 1})` }}>
            {count}
            <span className="sr-only"> {count === 1 ? "producto" : "productos"}</span>
          </span>
        </button>
      </div>
    </header>
  );
}
