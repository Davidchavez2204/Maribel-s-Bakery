/**
 * Carta de productos.
 * ⚠️ Precios y productos de EJEMPLO: confirmar con la clienta antes de publicar.
 *
 * Para agregar la foto de un producto: sube el archivo a /public/fotos/
 * (vertical 4:5, ~800×1000, WebP) y pon la ruta en `foto`, p. ej. "/fotos/torta-chocolate.webp".
 */

export const CATEGORIAS = [
  { id: "todos", label: "Todos" },
  { id: "pasteles", label: "Pasteles" },
  { id: "pays", label: "Pays" },
  { id: "cupcakes", label: "Cupcakes" },
  { id: "brownies", label: "Brownies" },
  { id: "catering", label: "Mesas de postres" },
] as const;

export type Filtro = (typeof CATEGORIAS)[number]["id"];
export type Categoria = Exclude<Filtro, "todos">;

export interface Producto {
  id: string;
  cat: Categoria;
  nombre: string;
  desc: string;
  /** En soles. `null` = se cotiza por WhatsApp (no suma al total). */
  precio: number | null;
  unidad: string;
  foto?: string;
}

export const CATEGORIA_LABEL: Record<Categoria, string> = Object.fromEntries(
  CATEGORIAS.filter((c) => c.id !== "todos").map((c) => [c.id, c.label]),
) as Record<Categoria, string>;

export const PRODUCTOS: readonly Producto[] = [
  { id: "torta-chocolate", cat: "pasteles", nombre: "Torta de chocolate", desc: "Bizcocho húmedo de cacao con fudge casero.", precio: 65, unidad: "Entera · 12 porciones" },
  { id: "tres-leches", cat: "pasteles", nombre: "Tres leches", desc: "Suave, bien remojada y con merengue italiano.", precio: 60, unidad: "Entera · 12 porciones" },
  { id: "torta-fresas", cat: "pasteles", nombre: "Torta de fresas con crema", desc: "Vainilla, crema chantilly y fresas frescas.", precio: 70, unidad: "Entera · 12 porciones" },
  { id: "pay-limon", cat: "pays", nombre: "Pay de limón", desc: "Base crocante, relleno cítrico y merengue dorado.", precio: 45, unidad: "Entero · 8 porciones" },
  { id: "pay-manzana", cat: "pays", nombre: "Pay de manzana", desc: "Manzana con canela en masa quebrada.", precio: 48, unidad: "Entero · 8 porciones" },
  { id: "cupcakes-vainilla", cat: "cupcakes", nombre: "Cupcakes de vainilla", desc: "Con frosting de mantequilla y decoración a elección.", precio: 30, unidad: "Caja de 6" },
  { id: "cupcakes-redvelvet", cat: "cupcakes", nombre: "Cupcakes red velvet", desc: "Con frosting de queso crema.", precio: 36, unidad: "Caja de 6" },
  { id: "brownies-clasicos", cat: "brownies", nombre: "Brownies clásicos", desc: "Densos, chocolatosos y con costra crujiente.", precio: 25, unidad: "Caja de 6" },
  { id: "brownies-nueces", cat: "brownies", nombre: "Brownies con nueces", desc: "Mi clásico, con nueces tostadas.", precio: 30, unidad: "Caja de 6" },
  { id: "mesa-postres", cat: "catering", nombre: "Mesa de postres", desc: "Para cumpleaños, bautizos y reuniones. Cuéntame la fecha, los invitados y la temática, y armo una propuesta a tu medida.", precio: null, unidad: "Según invitados" },
];

/** Índice O(1) por id; también sirve para descartar ids obsoletos guardados en localStorage. */
export const PRODUCTOS_POR_ID: ReadonlyMap<string, Producto> = new Map(PRODUCTOS.map((p) => [p.id, p]));

/** Fotos generales (opcional). Sube los archivos a /public/fotos/ y coloca la ruta. */
export const FOTOS = {
  hero: undefined as string | undefined, // 4:5, p. ej. "/fotos/hero.webp"
};
