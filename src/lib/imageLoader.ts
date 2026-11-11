import manifest from "@/data/fotos-manifest.json";

type Entrada = { ancho: number; variantes: number[] };
const FOTOS = manifest as Record<string, Entrada>;

/**
 * Loader de imágenes para el export estático (no hay servidor que optimice).
 * Next le pide cada ancho del srcset; devolvemos la variante pre-generada más chica
 * que lo cubra (scripts/optimizar-fotos.mjs), o el original si ninguna alcanza.
 * Así un teléfono descarga ~25 KB por tarjeta en vez de ~80 KB.
 */
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  const foto = FOTOS[src];
  if (!foto) return src;
  const w = foto.variantes.find((v) => v >= width);
  return w ? src.replace(/\.webp$/i, `-${w}w.webp`) : src;
}
