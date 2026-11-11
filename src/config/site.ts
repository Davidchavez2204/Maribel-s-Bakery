/**
 * Configuración central del negocio.
 * Todo dato que la clienta pueda querer cambiar vive aquí (o en src/data/productos.ts),
 * nunca repartido por los componentes.
 */
export const SITE = {
  nombre: "Mary's Bakery",
  titulo: "Mary's Bakery | Repostería hecha en casa",
  descripcion:
    "Postres de primera calidad, al alcance de tu mano. Tortas, cheesecakes, kekes y pays hechos en casa, por encargo. Elige tus postres y confirma tu pedido por WhatsApp.",
  tagline: "Postres hechos con amor, para cada ocasión.",
  /** Frase de la tarjeta de agradecimiento (manual de marca). */
  gracias: "Gracias por dejarme endulzar tu día.",
  /** URL pública; se define en Netlify con NEXT_PUBLIC_SITE_URL. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://marys-bakery.netlify.app").replace(/\/$/, ""),

  /** Número local (9 dígitos). El prefijo de país se agrega al armar el enlace. */
  whatsapp: "922965377",
  codigoPais: "51",
  /** Formato para mostrar en pantalla. */
  telefonoVisible: "922 965 377",

  direccion: "Av. Simón Bolívar 965, Depto. 1313",

  /** Si es false, los precios de la carta muestran «Consultar». */
  mostrarPrecios: true,
} as const;
