"use client";

import { Monograma } from "./Logo";
import { useOrder } from "@/context/OrderContext";
import styles from "./OrderUI.module.css";

export function Toast() {
  const { toast } = useOrder();
  return (
    // role=status: los lectores de pantalla anuncian «X se agregó a tu pedido» sin mover el foco.
    <div className={`${styles.toast} ${toast ? styles.toastShown : ""}`} role="status" aria-live="polite">
      <div className={styles.toastInner}>
        <Monograma size={22} className={styles.toastMono} />
        <span>{toast ?? ""}</span>
      </div>
    </div>
  );
}
