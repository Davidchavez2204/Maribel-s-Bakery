import type { NextConfig } from "next";

/**
 * Sitio 100 % estático: `next build` genera la carpeta `out/`,
 * que Netlify publica tal cual (sin funciones ni runtime de Node).
 */
const nextConfig: NextConfig = {
  output: "export",
  // Netlify sirve /ruta/ → /ruta/index.html sin redirecciones extra.
  trailingSlash: true,
  // Con export estático no existe el optimizador de imágenes de Next;
  // las fotos deben subirse ya optimizadas (WebP/AVIF) a /public/fotos.
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
