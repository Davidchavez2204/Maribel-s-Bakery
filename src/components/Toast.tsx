"use client";

import { Check } from "lucide-react";
import { useOrder } from "@/context/OrderContext";
import styles from "./OrderUI.module.css";

export function Toast() {
  const { toast } = useOrder();
  return (
    // role=status: los lectores de pantalla anuncian «X se agregó a tu pedido» sin mover el foco.
    <div className={`${styles.toast} ${toast ? styles.toastShown : ""}`} role="status" aria-live="polite">
      <div className={styles.toastInner}>
        <Check size={18} strokeWidth={1.8} color="var(--color-accent-700)" aria-hidden="true" />
        <span>{toast ?? ""}</span>
      </div>
    </div>
  );
}
