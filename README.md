# Maribel's Bakery — sitio web

Sitio de una sola página: carta de postres, carrito y envío del pedido como mensaje prellenado de WhatsApp.
Sin backend ni pagos en línea. **Next.js 16 (App Router) + React 19 + TypeScript + CSS Modules**, exportado como sitio estático.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # genera ./out (sitio estático listo para publicar)
npm run start      # sirve ./out localmente
npm run typecheck
```

Requiere Node 20 o superior.

## Despliegue en Netlify

**Opción A, con repositorio (recomendada):** sube el proyecto a GitHub, y en Netlify ve a *Add new site → Import from Git*.
`netlify.toml` ya define el comando de build (`npm run build`), la carpeta a publicar (`out`), Node 22, las cabeceras de seguridad y la caché.

**Opción B, inmediata:** arrastra la carpeta `out/` (o el zip `maribels-bakery-out.zip`) a <https://app.netlify.com/drop>.
⚠️ Con Netlify Drop **no** se aplica `netlify.toml` (no hay cabeceras de seguridad); úsala solo para salir rápido y migra a la opción A.

**Variable de entorno:** define `NEXT_PUBLIC_SITE_URL` en *Site configuration → Environment variables* con la URL final
(p. ej. `https://maribelsbakery.pe`). Se usa para la URL canónica, Open Graph y el sitemap. Después de cambiarla, vuelve a desplegar.

## Qué editar

| Qué | Dónde |
|---|---|
| Teléfono de WhatsApp, dirección, mostrar u ocultar precios | `src/config/site.ts` |
| Productos, precios, categorías | `src/data/productos.ts` |
| Fotos | Sube los archivos a `public/fotos/` y pon la ruta en `foto` (producto) o en `FOTOS` (hero y catering) |
| Formato del mensaje de WhatsApp | `src/lib/whatsapp.ts` |
| Colores (paleta «de cocina», modo claro y oscuro) | `src/app/globals.css` (`:root`) |
| Logos (sello, horizontal, monograma) | `src/components/Logo.tsx` (SVG oficiales con `currentColor`) |

**Fotos:** como el sitio es estático, Next no las optimiza. Súbelas ya optimizadas en WebP:
hero 4:5 (~1000×1250), productos 4:5 (~800×1000) y mesa de postres 3:2 (~1200×800), de menos de 200 KB cada una.
Según el manual: luz natural, fondos simples y sin filtros fuertes.
Mientras no haya foto se muestra un fondo Masa con el monograma de la marca.

## Arquitectura

```
src/
  app/            layout (SEO, fuentes, JSON-LD), page, robots, sitemap, íconos
  components/     secciones (Server Components) y UI interactiva (Client Components)
  context/        OrderContext: estado del pedido (useReducer) + persistencia en localStorage
  config/site.ts  datos del negocio
  data/           carta
  lib/            whatsapp.ts (funciones puras del mensaje), reveal.ts
```

- Las secciones estáticas se renderizan a HTML en el build y no envían JS. Solo la carta, el carrito y el panel son interactivos.
- Lo guardado en `localStorage` (`maribels_pedido_v1`) se valida al leerlo: se descartan ids inexistentes y cantidades inválidas.
- El botón «Enviar pedido» es un enlace `<a>` real hacia `wa.me`, así que ningún bloqueador de ventanas emergentes lo bloquea.

## Identidad visual (manual de marca)

- Paleta: Harina (fondo), Masa (tarjetas), Miel, Caramelo (solo líneas y texto grande), Canela (texto pequeño de acento) y Cacao (texto).
- Tipografía: Cormorant Garamond para títulos y Lora para textos. Sin negritas: el énfasis va en cursiva.
- Tono: primera persona de Maribel, tuteo, cálido y sin sonar a empresa.
- Modo oscuro automático (`prefers-color-scheme`): fondo Cacao y logo en Miel, como indica el manual para fondos oscuros.

## Pendientes con la clienta

- Carta y precios reales (los actuales son de ejemplo).
- Fotos reales.
- Zonas de delivery y horario de atención.
- Dominio final y `NEXT_PUBLIC_SITE_URL`.
