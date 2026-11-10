"use client";

import { MessageCircle, ShoppingBag } from "lucide-react";
import { useOrder } from "@/context/OrderContext";
import { WA_CONSULTA } from "@/lib/whatsapp";
import { LogoHorizontal } from "./Logo";
import styles from "./Header.module.css";

const NAV = [
  { href: "#productos", label: "La carta" },
  { href: "#como-pedir", label: "Cómo pedir" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Contacto" },
];

export function Header() {
  const { count, bump, openDrawer } = useOrder();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <a href="#inicio" className={styles.brand} aria-label="Maribel's Bakery, ir al inicio">
          {/* Monograma + nombre: el sello completo no se lee por debajo de 64 px (manual). */}
          <LogoHorizontal id="logo-header" compact height={56} />
        </a>

        <nav aria-label="Principal" className={styles.nav}>
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>{n.label}</a>
          ))}
        </nav>

        <div className={styles.actions}>
          <a
            href={WA_CONSULTA}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-ghost btn-icon ${styles.waMobile}`}
            aria-label="Escríbeme por WhatsApp"
          >
            <MessageCircle size={20} strokeWidth={1.5} aria-hidden="true" />
          </a>
          <button
            type="button"
            className={`btn btn-outline ${styles.cart}`}
            onClick={openDrawer}
            aria-haspopup="dialog"
            aria-controls="pedido-drawer"
          >
            <ShoppingBag size={18} strokeWidth={1.5} aria-hidden="true" />
            <span className={styles.cartLabel}>Mi pedido</span>
            <span className={`${styles.badge} tnum`} data-cart-target data-bump={bump || undefined} data-empty={count === 0 || undefined}>
              {count}
            </span>
            <span className="sr-only">, {count === 1 ? "1 producto" : `${count} productos`}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
