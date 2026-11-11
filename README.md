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
| Fotos | Sube el `.webp` a `public/fotos/` y pon la ruta en `foto` (producto) o en `FOTOS.hero`. Las versiones reducidas se generan solas (`npm run fotos`, corre antes de `dev` y `build`) |
| Formato del mensaje de WhatsApp | `src/lib/whatsapp.ts` |
| Colores (paleta «de cocina», modo claro y oscuro) | `src/app/globals.css` (`:root`) |
| Logos (sello, horizontal, monograma) | `src/components/Logo.tsx` (SVG oficiales con `currentColor`) |

**Fotos:** como el sitio es estático, Next no las optimiza. Súbelas ya optimizadas en WebP:
hero 4:5 (~1000×1250), productos 4:5 (~800×1000) y mesa de postres 4:3 (1200×900), de menos de 200 KB cada una.
Según el manual: luz natural, fondos simples y sin filtros fuertes.
Mientras no haya foto se muestra un fondo Masa con el monograma de la marca.
Los originales (JPG) se guardan en `assets/fotos-originales/`, fuera de `public/` y **fuera de git** (pesan ~3 MB c/u): respáldalos aparte, por ejemplo en Drive.

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

## Animaciones

Todas se desactivan si el usuario tiene activado «reducir movimiento» en su sistema.

| Dónde | Qué hace | Cómo |
|---|---|---|
| Hero | Titular línea por línea, foto con leve acercamiento, sello que se estampa | CSS `@keyframes` |
| Hero | La foto se mueve con el mouse | `HeroParallax.tsx` (variables CSS en `requestAnimationFrame`, sin re-render) |
| Hero, header | La foto se desplaza y el sello gira al bajar; el header gana sombra | CSS scroll-driven (`animation-timeline: scroll()`) |
| Carta, pasos, tarjeta | Las tarjetas suben al entrar; la línea de pasos se dibuja; la tarjeta de agradecimiento «cae» | CSS scroll-driven (`animation-timeline: view()`) |
| Al separar | Un sello vuela del botón al carrito; cantidades y total «saltan» | `lib/flyToCart.ts` (Web Animations API) |

Las animaciones ligadas al scroll son mejora progresiva: en navegadores sin soporte, el contenido simplemente aparece sin movimiento.

## Pruebas

Suite funcional de punta a punta (108 verificaciones: carta, filtros, carrito, validación, mensaje exacto de WhatsApp,
persistencia, modo privado, teclado, 5 dispositivos, accesibilidad WCAG 2.2 AA con axe, SEO). Nunca envía nada a WhatsApp.

```bash
npm i --no-save playwright axe-core && npx playwright install chromium   # una sola vez
npm run build
node qa/serve.cjs      # terminal 1: sirve out/ con la CSP de netlify.toml
node qa/suite.cjs      # terminal 2: resultados en consola y en qa/resultados.json
```

## Pendientes con la clienta

- Carta y precios reales (los actuales son de ejemplo).
- Fotos reales. **La imagen del hero (`public/fotos/hero.webp`) es una ilustración provisional**: reemplazarla por una foto real con el mismo nombre.
- Zonas de delivery y horario de atención.
- Dominio final y `NEXT_PUBLIC_SITE_URL`.
