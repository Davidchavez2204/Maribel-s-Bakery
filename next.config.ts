import type { NextConfig } from "next";

/**
 * Sitio 100 % estático: `next build` genera la carpeta `out/`,
 * que Netlify publica tal cual (sin funciones ni runtime de Node).
 */
const nextConfig: NextConfig = {
  output: "export",
  // Netlify sirve /ruta/ → /ruta/index.html sin redirecciones extra.
  trailingSlash: true,
  // Con export estático no hay optimizador de imágenes en servidor: un loader propio
  // sirve variantes pre-generadas (npm run fotos) según el ancho que pide cada pantalla.
  images: {
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
    // Anchos candidatos del srcset, alineados con las variantes que genera el script.
    deviceSizes: [400, 600, 800, 1200, 1600, 2400],
    imageSizes: [],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
