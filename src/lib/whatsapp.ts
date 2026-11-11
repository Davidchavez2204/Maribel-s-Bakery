import { SITE } from "@/config/site";
import type { Opcion, Producto } from "@/data/productos";

/** Formato de precio del diseño: «S/ 65» (sin decimales). */
export function formatMoney(n: number): string {
  return `S/ ${Math.round(n)}`;
}

/** Enlace universal de WhatsApp (funciona en móvil y en WhatsApp Web). */
export function waUrl(texto: string): string {
  const numero = `${SITE.codigoPais}${SITE.whatsapp.replace(/\D/g, "")}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

/** Saludo único de todos los enlaces: si cambia, cambia en toda la web (y en el mensaje del pedido). */
export const SALUDO = "Hola Mary, quiero hacer un pedido";

/** Enlace general (header, hero, barra de anuncio, footer). */
export const WA_PEDIDO = waUrl(SALUDO);
/** Botón flotante: pedidos fuera de la carta. Deja el cursor listo para que escriban qué postre quieren. */
export const WA_ANTOJO = waUrl(`${SALUDO} de un postre que no está en la carta: `);
export const WA_CATERING = waUrl(
  "Hola Mary, quisiera cotizar una mesa de postres.\nFecha: \nInvitados: \nTemática: ",
);

export type Entrega = "recojo" | "delivery";

export interface LineaPedido {
  /** Clave `producto:tamaño` (ver `clave()` en data/productos). */
  key: string;
  producto: Producto;
  opcion: Opcion;
  qty: number;
}

/** «Torta de chocolate · Media (6 porciones)» o «Mesa de postres (Según invitados)». */
export function describirLinea({ producto: p, opcion: o }: Pick<LineaPedido, "producto" | "opcion">): string {
  return o.tamano === "unico" ? `${p.nombre} (${o.detalle})` : `${p.nombre} · ${o.etiqueta} (${o.detalle})`;
}

export interface DatosPedido {
  nombre: string;
  /** ISO yyyy-mm-dd (valor de <input type="date">) o cadena vacía. */
  fecha: string;
  entrega: Entrega;
  notas: string;
}

export function totalReferencial(lineas: readonly LineaPedido[]): number {
  return lineas.reduce((acc, l) => acc + (l.opcion.precio ?? 0) * l.qty, 0);
}

export function hayCotizacion(lineas: readonly LineaPedido[]): boolean {
  return lineas.some((l) => l.opcion.precio === null);
}

/**
 * Arma el mensaje del pedido. Función pura (sin estado ni DOM)
 * para poder probarla y reutilizarla de forma aislada.
 */
export function mensajePedido(lineas: readonly LineaPedido[], datos: DatosPedido): string {
  const total = totalReferencial(lineas);
  const L: string[] = [`${SALUDO}:`, ""];

  for (const l of lineas) {
    const sub = l.opcion.precio === null ? "a cotizar" : formatMoney(l.opcion.precio * l.qty);
    L.push(`• ${l.qty} × ${describirLinea(l)}: ${sub}`);
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
