/**
 * Carta de productos de Mary's Bakery.
 *
 * Cada producto se vende en uno o más TAMAÑOS (entera, media, porción) con su propio precio.
 * Precios referenciales de mercado (Lima, noviembre 2026), por debajo de las pastelerías con local
 * (Dolce Mela, La Mora, Tanta), como corresponde a una repostería hecha en casa. La porción suelta
 * cuesta proporcionalmente más que la entera, como es habitual.
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

/** `unico`: productos que no se fraccionan (la mesa de postres se cotiza entera). */
export type Tamano = "entera" | "media" | "porcion" | "unico";

export interface Opcion {
  tamano: Tamano;
  /** Lo que ve el cliente: «Entera», «Medio», «Tajada»… */
  etiqueta: string;
  /** Rendimiento: «12 porciones», «Individual»… */
  detalle: string;
  /** En soles. `null` = se cotiza por WhatsApp (no suma al total). */
  precio: number | null;
}

export interface Producto {
  id: string;
  cat: Categoria;
  nombre: string;
  desc: string;
  foto?: string;
  /** Ordenadas de mayor a menor: la primera es el «nivel 1» de la tarjeta. */
  opciones: readonly Opcion[];
}

/**
 * Arma los tres niveles de un producto fraccionable.
 * @param genero «f» → Entera/Media (torta) · «m» → Entero/Medio (cheesecake, pay, keke)
 */
function niveles(
  genero: "f" | "m",
  porciones: number,
  [entera, media, porcion]: [number, number, number],
  { unidad = "porciones", porcionLabel = "Porción" } = {},
): Opcion[] {
  const f = genero === "f";
  return [
    { tamano: "entera", etiqueta: f ? "Entera" : "Entero", detalle: `${porciones} ${unidad}`, precio: entera },
    { tamano: "media", etiqueta: f ? "Media" : "Medio", detalle: `${porciones / 2} ${unidad}`, precio: media },
    { tamano: "porcion", etiqueta: porcionLabel, detalle: "Individual", precio: porcion },
  ];
}

export const PRODUCTOS: readonly Producto[] = [
  // Tortas · referencia entera: S/ 77–119 en pastelerías de Lima
  { id: "torta-chocolate", cat: "tortas", nombre: "Torta de chocolate", desc: "Bizcocho húmedo de cacao, cubierto de fudge y chispas de chocolate.", foto: "/fotos/torta-chocolate.webp", opciones: niveles("f", 12, [85, 48, 10]) },
  { id: "tres-leches", cat: "tortas", nombre: "Tres leches", desc: "Suave, bien remojada, con crema batida y un toque de canela.", foto: "/fotos/tres-leches.webp", opciones: niveles("f", 12, [70, 40, 9]) },
  { id: "torta-zanahoria", cat: "tortas", nombre: "Torta de zanahoria", desc: "Húmeda y especiada, con frosting de queso crema y nueces.", foto: "/fotos/torta-zanahoria.webp", opciones: niveles("f", 12, [85, 48, 10]) },

  // Cheesecakes · referencia entero: S/ 90–105
  { id: "cheesecake-fresa", cat: "cheesecakes", nombre: "Cheesecake de fresa", desc: "Base de galleta, relleno cremoso de queso y cobertura de fresas frescas.", foto: "/fotos/cheesecake-fresa.webp", opciones: niveles("m", 8, [79, 45, 13]) },
  { id: "cheesecake-maracuya", cat: "cheesecakes", nombre: "Cheesecake de maracuyá", desc: "Relleno suave de queso con una capa de maracuyá y sus pepitas, ácida y fresca.", foto: "/fotos/cheesecake-maracuya.webp", opciones: niveles("m", 8, [79, 45, 13]) },
  { id: "cheesecake-arandanos", cat: "cheesecakes", nombre: "Cheesecake de arándanos", desc: "Cremoso por dentro, con base de galleta y una capa generosa de arándanos.", foto: "/fotos/cheesecake-arandanos.webp", opciones: niveles("m", 8, [85, 48, 14]) },

  // Kekes · referencia molde: S/ 25–28
  { id: "keke-naranja", cat: "kekes", nombre: "Keke de naranja", desc: "Esponjoso, con jugo y ralladura de naranja. El de la hora del lonche.", foto: "/fotos/keke-naranja.webp", opciones: niveles("m", 10, [26, 15, 4], { unidad: "tajadas", porcionLabel: "Tajada" }) },
  { id: "keke-platano", cat: "kekes", nombre: "Keke de plátano", desc: "Húmedo, con plátano maduro y nueces, como el de casa.", foto: "/fotos/keke-platano.webp", opciones: niveles("m", 10, [28, 16, 4], { unidad: "tajadas", porcionLabel: "Tajada" }) },

  // Pays · referencia: pie de limón S/ 89–95; pastel de acelga S/ 50–84 (porción en restaurante: S/ 18)
  { id: "pay-limon", cat: "pays", nombre: "Pay de limón", desc: "Base crocante, relleno cítrico y merengue dorado.", foto: "/fotos/pay-limon.webp", opciones: niveles("m", 8, [65, 37, 11]) },
  { id: "pay-manzana", cat: "pays", nombre: "Pay de manzana", desc: "Manzana con canela en masa quebrada, con su enrejado de siempre.", foto: "/fotos/pay-manzana.webp", opciones: niveles("m", 8, [69, 39, 11]) },
  { id: "pastel-acelga", cat: "pays", nombre: "Pastel de acelga", desc: "El salado de la carta: masa casera rellena de acelga, queso y huevo.", foto: "/fotos/pastel-acelga.webp", opciones: niveles("m", 8, [55, 31, 9]) },

  // Mesa de postres · se cotiza según invitados
  {
    id: "mesa-postres",
    cat: "catering",
    nombre: "Mesa de postres",
    desc: "Bocaditos dulces y salados para cumpleaños, bautizos y reuniones: alfajores, pionono, empanaditas y pancitos rellenos. Cuéntame la fecha y los invitados, y armo una propuesta a tu medida.",
    foto: "/fotos/mesa-postres.webp",
    opciones: [{ tamano: "unico", etiqueta: "Mesa de postres", detalle: "Según invitados", precio: null }],
  },
];

/** Índice O(1) por id. */
export const PRODUCTOS_POR_ID: ReadonlyMap<string, Producto> = new Map(PRODUCTOS.map((p) => [p.id, p]));

/** Clave de una línea del carrito: el mismo postre en dos tamaños son dos líneas. */
export const clave = (id: string, tamano: Tamano): string => `${id}:${tamano}`;

/**
 * Índice O(1) clave → producto y opción. También sirve para descartar claves obsoletas
 * o manipuladas que vengan de localStorage.
 */
export const OPCIONES_POR_CLAVE: ReadonlyMap<string, { producto: Producto; opcion: Opcion }> = new Map(
  PRODUCTOS.flatMap((producto) => producto.opciones.map((opcion) => [clave(producto.id, opcion.tamano), { producto, opcion }] as const)),
);

/** Fotos generales (opcional). Sube los archivos a /public/fotos/ y coloca la ruta. */
export const FOTOS = {
  /** Foto horizontal a sangre completa (~2000×1300, WebP < 300 KB), p. ej. "/fotos/hero.webp".
   *  El texto va a la izquierda: conviene que el postre esté a la derecha del encuadre. */
  hero: "/fotos/hero.webp" as string | undefined,
  /** Qué parte de la foto se prioriza al recortar (CSS object-position).
   *  En escritorio la foto cubre el ancho y se recorta en alto (se prioriza la mesa);
   *  en móvil se recorta en ancho (se prioriza el cheesecake del centro-derecha). */
  heroPosicion: "62% 64%",
};
