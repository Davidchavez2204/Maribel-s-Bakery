"use client";

import { ShoppingBag } from "lucide-react";
import { useOrder } from "@/context/OrderContext";
import { formatMoney, totalReferencial } from "@/lib/whatsapp";
import styles from "./OrderUI.module.css";

/** Píldora flotante: visible solo con productos en el pedido y el panel cerrado. */
export function OrderBar() {
  const { count, lineas, open, openDrawer } = useOrder();
  const shown = count > 0 && !open;

  return (
    <div className={`${styles.bar} ${shown ? styles.barShown : ""}`} inert={!shown}>
      <button type="button" className={styles.barBtn} onClick={openDrawer} aria-controls="pedido-drawer">
        <ShoppingBag size={18} strokeWidth={1.5} color="var(--color-accent-700)" aria-hidden="true" />
        <span>{count === 1 ? "1 producto" : `${count} productos`}</span>
        <span className={`${styles.barTotal} tnum`}>{formatMoney(totalReferencial(lineas))}</span>
        <span className={styles.barCta}>Ver pedido →</span>
      </button>
    </div>
  );
}
