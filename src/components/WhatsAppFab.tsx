"use client";

import { useOrder } from "@/context/OrderContext";
import { WA_ANTOJO } from "@/lib/whatsapp";
import styles from "./WhatsAppFab.module.css";

/** Glifo oficial de WhatsApp (simple-icons, CC0). Se copia la ruta para no sumar una dependencia por un ícono. */
function IconoWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

const PREGUNTA = "¿No encuentras lo que buscas?";
const DETALLE = "Escríbeme y te lo preparo";

/**
 * Botón flotante de WhatsApp (abajo a la derecha) para pedidos fuera de la carta.
 * - Escritorio: píldora con la pregunta y el detalle. Móvil: disco verde + globo fijo con la pregunta.
 * - Con productos en el pedido aparece la barra «Ver mi pedido»: el botón se compacta al ícono y,
 *   donde no caben los dos, sube para no taparla. Con el panel abierto se oculta.
 * El nombre accesible incluye todo el texto visible (WCAG 2.5.3) aunque el texto se oculte en móvil.
 */
export function WhatsAppFab() {
  const { count, open } = useOrder();
  return (
    <a
      href={WA_ANTOJO}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.fab}
      data-compacto={count > 0 || undefined}
      data-oculto={open || undefined}
      inert={open}
      aria-label={`${PREGUNTA} ${DETALLE}. Abre WhatsApp en una pestaña nueva.`}
    >
      <span className={styles.icon}>
        <IconoWhatsApp />
      </span>
      <span className={styles.texto} aria-hidden="true">
        <span className={styles.pregunta}>{PREGUNTA}</span>
        <span className={styles.detalle}>{DETALLE}</span>
      </span>
    </a>
  );
}
