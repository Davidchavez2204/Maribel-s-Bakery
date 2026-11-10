"use client";

import { Minus, Plus } from "lucide-react";
import styles from "./Stepper.module.css";

interface StepperProps {
  qty: number;
  label: string;
  onDec: () => void;
  onInc: () => void;
  size?: "md" | "sm";
}

/** Control: menos, cantidad, más. Reutilizado en la tarjeta de producto y en el panel del pedido. */
export function Stepper({ qty, label, onDec, onInc, size = "md" }: StepperProps) {
  const icon = size === "md" ? 16 : 14;
  return (
    <div className={`${styles.stepper} ${styles[size]}`} role="group" aria-label={`Cantidad de ${label}`}>
      <button type="button" onClick={onDec} aria-label={`Quitar uno de ${label}`}>
        <Minus size={icon} strokeWidth={1.6} aria-hidden="true" />
      </button>
      <span className="tnum" aria-live="polite">{qty}</span>
      <button type="button" onClick={onInc} aria-label={`Agregar uno de ${label}`}>
        <Plus size={icon} strokeWidth={1.6} aria-hidden="true" />
      </button>
    </div>
  );
}
