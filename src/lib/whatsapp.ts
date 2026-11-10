import { SITE } from "@/config/site";
import type { Producto } from "@/data/productos";

/** Formato de precio del diseño: «S/ 65» (sin decimales). */
export function formatMoney(n: number): string {
  return `S/ ${Math.round(n)}`;
}

/** Enlace universal de WhatsApp (funciona en móvil y en WhatsApp Web). */
export function waUrl(texto: string): string {
  const numero = `${SITE.codigoPais}${SITE.whatsapp.replace(/\D/g, "")}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export const WA_CONSULTA = waUrl("Hola Maribel, quisiera hacerte una consulta.");
export const WA_CATERING = waUrl(
  "Hola Maribel, quisiera cotizar una mesa de postres.\nFecha: \nInvitados: \nTemática: ",
);

export type Entrega = "recojo" | "delivery";

export interface LineaPedido {
  producto: Producto;
  qty: number;
}

export interface DatosPedido {
  nombre: string;
  /** ISO yyyy-mm-dd (valor de <input type="date">) o cadena vacía. */
  fecha: string;
  entrega: Entrega;
  notas: string;
}

export function totalReferencial(lineas: readonly LineaPedido[]): number {
  return lineas.reduce((acc, l) => acc + (l.producto.precio ?? 0) * l.qty, 0);
}

export function hayCotizacion(lineas: readonly LineaPedido[]): boolean {
  return lineas.some((l) => l.producto.precio === null);
}

/**
 * Arma el mensaje del pedido. Función pura (sin estado ni DOM)
 * para poder probarla y reutilizarla de forma aislada.
 */
export function mensajePedido(lineas: readonly LineaPedido[], datos: DatosPedido): string {
  const total = totalReferencial(lineas);
  const L: string[] = ["Hola Maribel, quisiera separar este pedido:", ""];

  for (const { producto: p, qty } of lineas) {
    const sub = p.precio === null ? "a cotizar" : formatMoney(p.precio * qty);
    L.push(`• ${qty} × ${p.nombre} (${p.unidad}): ${sub}`);
  }

  L.push("", `Total referencial: ${formatMoney(total)}${hayCotizacion(lineas) ? " + mesa de postres a cotizar" : ""}`, "");
  L.push(`Nombre: ${datos.nombre.trim()}`);

  if (datos.fecha) {
    const [y, m, d] = datos.fecha.split("-");
    L.push(`Fecha: ${d}/${m}/${y}`);
  }

  L.push(`Entrega: ${datos.entrega === "recojo" ? `Recojo en ${SITE.direccion}` : "Delivery (por coordinar)"}`);

  const notas = datos.notas.trim();
  if (notas) L.push(`Notas: ${notas}`);

  L.push("", "Quedo atento(a) a la confirmación. ¡Gracias!");
  return L.join("\n");
}
