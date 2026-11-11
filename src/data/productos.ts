/**
 * Carta de productos.
 * Precios referenciales de mercado (Lima, noviembre 2026), ubicados por debajo de las pastelerías
 * con local (Dolce Mela, La Mora, Tanta), como corresponde a una repostería hecha en casa.
 * ⚠️ Confirmar cada precio con la clienta antes de publicar.
 *
 * Fotos: archivo en /public/fotos/ (vertical 4:5, 800×1000, WebP) y su ruta en `foto`.
 */

export const CATEGORIAS = [
  { id: "todos", label: "Todos" },
  { id: "tortas", label: "Tortas" },
  { id: "cheesecakes", label: "Cheesecakes" },
  { id: "kekes", label: "Kekes" },
  { id: "pays", label: "Pays" },
  { id: "catering", label: "Mesa de postres" },
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
  // Tortas · referencia: S/ 77–119 la entera en pastelerías de Lima
  { id: "torta-chocolate", cat: "tortas", nombre: "Torta de chocolate", desc: "Bizcocho húmedo de cacao, cubierto de fudge y chispas de chocolate.", precio: 85, unidad: "Entera · 12 porciones", foto: "/fotos/torta-chocolate.webp" },
  { id: "tres-leches", cat: "tortas", nombre: "Tres leches", desc: "Suave, bien remojada, con crema batida y un toque de canela.", precio: 70, unidad: "Entera · 12 porciones", foto: "/fotos/tres-leches.webp" },
  { id: "torta-zanahoria", cat: "tortas", nombre: "Torta de zanahoria", desc: "Húmeda y especiada, con frosting de queso crema y nueces.", precio: 85, unidad: "Entera · 12 porciones", foto: "/fotos/torta-zanahoria.webp" },

  // Cheesecakes · referencia: S/ 90–105 el entero
  { id: "cheesecake-fresa", cat: "cheesecakes", nombre: "Cheesecake de fresa", desc: "Base de galleta, relleno cremoso de queso y cobertura de fresas frescas.", precio: 79, unidad: "Entero · 8 porciones", foto: "/fotos/cheesecake-fresa.webp" },
  { id: "cheesecake-maracuya", cat: "cheesecakes", nombre: "Cheesecake de maracuyá", desc: "Relleno suave de queso con una capa de maracuyá y sus pepitas, ácida y fresca.", precio: 79, unidad: "Entero · 8 porciones", foto: "/fotos/cheesecake-maracuya.webp" },
  { id: "cheesecake-arandanos", cat: "cheesecakes", nombre: "Cheesecake de arándanos", desc: "Cremoso por dentro, con base de galleta y una capa generosa de arándanos.", precio: 85, unidad: "Entero · 8 porciones", foto: "/fotos/cheesecake-arandanos.webp" },

  // Kekes · referencia: S/ 25–28
  { id: "keke-naranja", cat: "kekes", nombre: "Keke de naranja", desc: "Esponjoso, con jugo y ralladura de naranja. El de la hora del lonche.", precio: 26, unidad: "Molde · 10 tajadas", foto: "/fotos/keke-naranja.webp" },
  { id: "keke-platano", cat: "kekes", nombre: "Keke de plátano", desc: "Húmedo, con plátano maduro y nueces, como el de casa.", precio: 28, unidad: "Molde · 10 tajadas", foto: "/fotos/keke-platano.webp" },

  // Pays · referencia: pie de limón S/ 89–95; pastel de acelga S/ 50–84
  { id: "pay-limon", cat: "pays", nombre: "Pay de limón", desc: "Base crocante, relleno cítrico y merengue dorado.", precio: 65, unidad: "Entero · 8 porciones", foto: "/fotos/pay-limon.webp" },
  { id: "pay-manzana", cat: "pays", nombre: "Pay de manzana", desc: "Manzana con canela en masa quebrada, con su enrejado de siempre.", precio: 69, unidad: "Entero · 8 porciones", foto: "/fotos/pay-manzana.webp" },
  { id: "pastel-acelga", cat: "pays", nombre: "Pastel de acelga", desc: "El salado de la carta: masa casera rellena de acelga, queso y huevo.", precio: 55, unidad: "Entero · 8 porciones", foto: "/fotos/pastel-acelga.webp" },

  // Mesa de postres · se cotiza según invitados
  { id: "mesa-postres", cat: "catering", nombre: "Mesa de postres", desc: "Bocaditos dulces y salados para cumpleaños, bautizos y reuniones: alfajores, pionono, empanaditas y pancitos rellenos. Cuéntame la fecha y los invitados, y armo una propuesta a tu medida.", precio: null, unidad: "Según invitados", foto: "/fotos/mesa-postres.webp" },
];

/** Índice O(1) por id; también sirve para descartar ids obsoletos guardados en localStorage. */
export const PRODUCTOS_POR_ID: ReadonlyMap<string, Producto> = new Map(PRODUCTOS.map((p) => [p.id, p]));

/** Fotos generales (opcional). Sube los archivos a /public/fotos/ y coloca la ruta. */
export const FOTOS = {
  /** Foto horizontal a sangre completa (~2000×1300, WebP < 300 KB), p. ej. "/fotos/hero.webp".
   *  El texto va a la izquierda: conviene que el postre esté a la derecha del encuadre. */
  // ⚠️ PROVISIONAL: ilustración generada para maquetar. Reemplazar por una foto real de Maribel.
  hero: "/fotos/hero.webp" as string | undefined,
  /** Qué parte de la foto se prioriza al recortar (CSS object-position). */
  heroPosicion: "78% 60%",
};
