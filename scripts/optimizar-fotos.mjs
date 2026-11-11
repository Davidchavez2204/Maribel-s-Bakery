/**
 * Genera versiones reducidas de cada foto de /public/fotos para imágenes responsivas.
 *
 *   npm run fotos          (también corre solo antes de `dev` y `build`)
 *
 * - Para cada foto.webp crea foto-400w.webp, foto-600w.webp… (solo anchos menores al original).
 * - Escribe src/data/fotos-manifest.json, que usa el loader (src/lib/imageLoader.ts)
 *   para saber qué anchos existen y servir el más chico que alcance.
 * - Es idempotente: no regenera variantes que ya están al día.
 */
import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const DIR = path.join(ROOT, "public", "fotos");
const MANIFEST = path.join(ROOT, "src", "data", "fotos-manifest.json");
const ANCHOS = [400, 600, 800, 1200, 1600];
const VARIANTE = /-\d+w\.webp$/i;

const files = (await readdir(DIR)).filter((f) => f.toLowerCase().endsWith(".webp") && !VARIANTE.test(f)).sort();
const manifest = {};
let creadas = 0;

for (const f of files) {
  const src = path.join(DIR, f);
  const { width = 0 } = await sharp(src).metadata();
  const base = f.replace(/\.webp$/i, "");
  const disponibles = [];
  const srcTime = (await stat(src)).mtimeMs;
  for (const w of ANCHOS.filter((a) => a < width)) {
    const out = path.join(DIR, `${base}-${w}w.webp`);
    const fresca = await stat(out).then((s) => s.mtimeMs >= srcTime).catch(() => false);
    if (!fresca) {
      await sharp(src).resize({ width: w }).webp({ quality: 78, effort: 6 }).toFile(out);
      creadas++;
    }
    disponibles.push(w);
  }
  manifest[`/fotos/${f}`] = { ancho: width, variantes: disponibles };
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`fotos: ${files.length} originales, ${creadas} variantes nuevas -> src/data/fotos-manifest.json`);
