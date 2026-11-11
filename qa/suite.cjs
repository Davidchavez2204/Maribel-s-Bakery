// Suite funcional de Mary's Bakery sobre el build de producción (out/) servido con la CSP de netlify.toml.
// Uso (ver README, sección «Pruebas»):
//   npm run build
//   node qa/serve.cjs            # en otra terminal: sirve out/ en http://localhost:4173 con la CSP real
//   node qa/suite.cjs            # requiere: npm i --no-save playwright axe-core && npx playwright install chromium
// Nunca abre WhatsApp real: las navegaciones a wa.me se interceptan y solo se verifica el mensaje.
const { chromium, devices } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = "http://localhost:4173/";
const OUT = process.argv[2] ?? path.join(__dirname, "..", "out");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const results = [];
let current = "";
const check = (name, ok, detail = "") => {
  results.push({ grupo: current, name, ok: !!ok, detail: ok ? "" : String(detail) });
  console.log(`${ok ? "PASS" : "FAIL"}  [${current}] ${name}${ok ? "" : "  -> " + detail}`);
};
const group = (g) => (current = g);

const LS_KEY = "marys_pedido_v2";
const LEGACY_KEY = "maribels_pedido_v1";
const sel = {
  // Botón «+» (o el «+» del control de cantidad) de un nivel de precio: 1 entera, 2 media, 3 porción.
  nivel: (id, n = 1) => `article:has(#prod-${id}) li[data-nivel="${n}"] button[aria-label^="Agregar"]`,
  menos: (id, n = 1) => `article:has(#prod-${id}) li[data-nivel="${n}"] button[aria-label^="Quitar uno"]`,
  mesa: 'button[aria-label="Separar Mesa de postres"]',
  inc: (n) => `#productos button[aria-label="Agregar uno de ${n}"]`,
  dec: (n) => `#productos button[aria-label="Quitar uno de ${n}"]`,
  badge: "header [data-cart-target]",
  cartBtn: 'header button[aria-controls="pedido-drawer"]',
  drawer: "#pedido-drawer",
  send: '#pedido-drawer a:has-text("Enviar por WhatsApp")',
  chip: (t) => `[aria-label="Filtrar la carta por categoría"] button:text-is("${t}")`,
};
// [nombre, id, precio entero/entera]
const PRODUCTOS = [
  ["Torta de chocolate", "torta-chocolate", 85], ["Tres leches", "tres-leches", 70], ["Torta de zanahoria", "torta-zanahoria", 85],
  ["Cheesecake de fresa", "cheesecake-fresa", 79], ["Cheesecake de maracuyá", "cheesecake-maracuya", 79], ["Cheesecake de arándanos", "cheesecake-arandanos", 85],
  ["Keke de naranja", "keke-naranja", 26], ["Keke de plátano", "keke-platano", 28],
  ["Pay de limón", "pay-limon", 65], ["Pay de manzana", "pay-manzana", 69], ["Pastel de acelga", "pastel-acelga", 55],
  ["Mesa de postres", "mesa-postres", null],
];
const agregar = (page, id, n = 1) => (id === "mesa-postres" ? page.click(sel.mesa) : page.click(sel.nivel(id, n)));
const todayLima = () => new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 10);
const innerWidthOf = (dev) => (dev.viewport ?? dev.screen).width;
const waText = (href) => decodeURIComponent(new URL(href).searchParams.get("text") ?? "");

async function newPage(browser, opts = {}, { init } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, timezoneId: "America/Lima", locale: "es-PE", ...opts });
  if (init) await ctx.addInitScript(init);
  const page = await ctx.newPage();
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") page.errors.push("console: " + m.text()); });
  page.bad = [];
  page.on("response", (r) => { if (r.status() >= 400) page.bad.push(r.status() + " " + r.url()); });
  // Nunca abrir WhatsApp real: se bloquea cualquier navegación a wa.me y se registra.
  page.waOpened = [];
  await ctx.route(/wa\.me|api\.whatsapp\.com/, (route) => { page.waOpened.push(route.request().url()); route.abort(); });
  await page.goto(BASE, { waitUntil: "networkidle" });
  return { ctx, page };
}
const badge = async (p) => Number((await p.textContent(sel.badge)).trim());
const scrollAll = async (p) => p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } scrollTo(0, 0); });

(async () => {
  const browser = await chromium.launch();

  /* ───────────── 1. Carga y contenido ───────────── */
  group("Carga");
  {
    const { ctx, page } = await newPage(browser);
    const resp = await page.request.get(BASE);
    check("index responde 200", resp.status() === 200, resp.status());
    check("título correcto", (await page.title()).startsWith("Mary's Bakery"), await page.title());
    // Las fotos de la carta cargan en diferido: se lleva cada una a pantalla y se espera su decodificación.
    const imgs = await page.$$eval("img", async (els) => {
      const out = [];
      for (const e of els) {
        e.scrollIntoView({ block: "center" });
        const ok = await Promise.race([e.decode().then(() => e.naturalWidth > 0, () => false), new Promise((r) => setTimeout(() => r(false), 8000))]);
        out.push({ src: e.currentSrc || e.getAttribute("src"), ok });
      }
      return out;
    });
    check(`todas las imágenes cargan (${imgs.length})`, imgs.every((i) => i.ok), imgs.filter((i) => !i.ok).map((i) => i.src).join(", "));
    check("sin recursos 4xx/5xx", page.bad.length === 0, page.bad.join(" | "));
    check("sin errores de consola ni violaciones CSP", page.errors.length === 0, page.errors.join(" | "));
    check("12 productos en la carta", (await page.$$("#productos article")).length === 12, (await page.$$("#productos article")).length);
    const precios = await page.$$eval("#productos article", (as) => as.map((a) => a.textContent));
    const faltan = PRODUCTOS.filter(([n, , p]) => !precios.some((t) => t.includes(n) && (p === null ? t.includes("A cotizar") : t.includes(`S/ ${p}`))));
    check("cada producto muestra su nombre y precio", faltan.length === 0, faltan.map((f) => f[0]).join(", "));
    const tiers = await page.$$eval("#productos article ul", (uls) => uls.map((ul) => {
      const li = [...ul.querySelectorAll("li")];
      const precio = (x) => Number((x.querySelector('[class*="tierPrice"]')?.textContent ?? "").replace(/[^0-9.]/g, ""));
      const font = (x) => parseFloat(getComputedStyle(x.querySelector('[class*="tierPrice"]')).fontSize);
      const alto = (x) => x.querySelector("button").getBoundingClientRect().height;
      return { n: li.length, preciosBajan: li.every((x, i) => i === 0 || precio(x) < precio(li[i - 1])), fuenteBaja: li.every((x, i) => i === 0 || font(x) < font(li[i - 1])), escalon: li.every((x, i) => i === 0 || alto(x) < alto(li[i - 1])), iconos: li.every((x) => !!x.querySelector("svg")) };
    }));
    check("11 productos con 3 niveles: entera, media y porción", tiers.length === 11 && tiers.every((t) => t.n === 3), JSON.stringify(tiers.map((t) => t.n)));
    check("en cada nivel el precio baja (entera > media > porción)", tiers.every((t) => t.preciosBajan));
    check("jerarquía visual: el precio de la entera es el más grande y cada nivel baja un escalón", tiers.every((t) => t.fuenteBaja && t.escalon));
    const altoPrecios = await page.$eval("#productos article ul", (ul) => ul.getBoundingClientRect().height);
    check(`bloque de precios compacto (${Math.round(altoPrecios)} px, una sola fila)`, altoPrecios <= 110, altoPrecios);
    check("cada nivel tiene su ícono (entera, media, porción)", tiers.every((t) => t.iconos));
    await ctx.close();
  }

  /* ───────────── 2. Navegación y filtros ───────────── */
  group("Navegación");
  {
    const { ctx, page } = await newPage(browser);
    for (const [txt, id] of [["La carta", "productos"], ["Cómo pedir", "como-pedir"], ["Nosotros", "nosotros"], ["Contacto", "contacto"]]) {
      await page.click(`header nav a:text-is("${txt}")`);
      // Espera a que el scroll suave termine (la carta es larga y el recorrido varía).
      await page.evaluate(async () => {
        await new Promise((r) => setTimeout(r, 150));
        let last = -1, quietos = 0;
        for (let i = 0; i < 60 && quietos < 3; i++) { await new Promise((r) => setTimeout(r, 100)); quietos = scrollY === last ? quietos + 1 : 0; last = scrollY; }
      });
      const r = await page.$eval(`#${id}`, (e) => { const b = e.getBoundingClientRect(); return { top: b.top, bottom: b.bottom, end: Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 2 }; });
      // La última sección (footer) no puede subir más que el final de la página: basta con que quede entera en pantalla.
      const ok = (r.top >= -5 && r.top < 160) || (r.end && r.top < 900 && r.bottom <= 900 + 2);
      check(`menú «${txt}» lleva a su sección`, ok, JSON.stringify(r));
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.click('a:has-text("Ver la carta")'); await page.waitForTimeout(900);
    const t2 = await page.$eval("#productos", (e) => e.getBoundingClientRect().top);
    check("botón «Ver la carta» del hero baja a la carta", t2 < 160, t2);
    const esperado = { Todos: 12, Tortas: 3, Cheesecakes: 3, Kekes: 2, Pays: 3, "Mesa de postres": 1 };
    for (const [chip, n] of Object.entries(esperado)) {
      await page.click(sel.chip(chip)); await page.waitForTimeout(200);
      const c = (await page.$$("#productos article")).length;
      const pressed = await page.getAttribute(sel.chip(chip), "aria-pressed");
      const cnt = (await page.textContent('#productos p[aria-live="polite"]')).trim();
      check(`filtro «${chip}» muestra ${n}`, c === n && pressed === "true" && cnt.startsWith(String(n)), `${c} tarjetas, aria-pressed=${pressed}, contador="${cnt}"`);
    }
    const wa = await page.$$eval('a[href*="wa.me"]', (as) => [...new Set(as.map((a) => a.href))]);
    check("todos los enlaces de WhatsApp van al 51 922 965 377", wa.length >= 2 && wa.every((h) => h.startsWith("https://wa.me/51922965377?text=")), wa.join(" "));
    check("los enlaces de WhatsApp abren en pestaña nueva y seguros", await page.$$eval('a[href*="wa.me"]', (as) => as.every((a) => a.target === "_blank" && a.rel.includes("noopener"))));
    const waHeader = waText(await page.getAttribute('header a[href*="wa.me"]', "href"));
    check("mensaje predeterminado: «Hola Mary, quiero hacer un pedido»", waHeader === "Hola Mary, quiero hacer un pedido", waHeader);
    const fab = page.locator('a[aria-label^="¿Antojo de otro postre?"]');
    await page.waitForTimeout(2000); // entrada animada del botón (1.2 s + 0.6 s)
    const fabBox = await fab.boundingBox();
    check("botón flotante de WhatsApp visible abajo a la derecha", !!fabBox && fabBox.x + fabBox.width >= 1366 - 40 && fabBox.y + fabBox.height >= 900 - 40, JSON.stringify(fabBox));
    check("el botón flotante muestra la pregunta en escritorio", await page.isVisible('a[aria-label^="¿Antojo"] :text("¿Antojo de otro postre?")'));
    const waFab = waText(await fab.getAttribute("href"));
    check("el botón flotante abre WhatsApp con el saludo y el pedido fuera de carta", waFab.startsWith("Hola Mary, quiero hacer un pedido de un postre que no está en la carta"), waFab);
    await ctx.close();
  }

  /* ───────────── 3. Carrito ───────────── */
  group("Carrito");
  {
    const { ctx, page } = await newPage(browser);
    await page.click(sel.chip("Todos"));
    let suma = 0;
    for (const [, id, p] of PRODUCTOS) { await agregar(page, id); suma += p ?? 0; await page.waitForTimeout(60); }
    await page.waitForTimeout(400);
    check("separar los 12 productos deja el contador en 12", (await badge(page)) === 12, await badge(page));
    check("cada tarjeta muestra el sello «separado»", (await page.$$('#productos article [class*="stamp"]')).length >= 12, (await page.$$('#productos article [class*="stamp"]')).length);
    const bar = (await page.textContent('[class*="barBtn"]')).replace(/\s+/g, " ");
    check(`barra flotante muestra 12 postres y S/ ${suma}`, bar.includes("12 postres") && bar.includes(`S/ ${suma}`), bar);
    await page.click(sel.nivel("tres-leches")); await page.waitForTimeout(100);
    check("botón + suma 1", (await badge(page)) === 13);
    await page.click(sel.menos("tres-leches")); await page.click(sel.menos("tres-leches")); await page.waitForTimeout(150);
    check("al bajar a 0 vuelve el botón «+» del nivel", (await page.$$(sel.menos("tres-leches"))).length === 0 && (await page.isVisible(sel.nivel("tres-leches"))));
    check("contador refleja la resta", (await badge(page)) === 11, await badge(page));
    // Tamaños mezclados del mismo postre
    await page.click(sel.nivel("torta-chocolate", 2)); await page.click(sel.nivel("torta-chocolate", 3)); await page.click(sel.nivel("torta-chocolate", 3));
    await page.waitForTimeout(300);
    const stampTxt = await page.$eval('article:has(#prod-torta-chocolate) [class*="stamp"]', (e) => e.textContent);
    check("mismo postre en 3 tamaños: el sello suma todo (×4)", stampTxt.includes("4"), stampTxt);
    check("contador con tamaños mezclados (11 + 3 = 14)", (await badge(page)) === 14, await badge(page));

    // Panel
    await page.click(sel.cartBtn); await page.waitForTimeout(500);
    check("el panel se abre desde «Mi pedido»", await page.$eval(sel.drawer, (d) => !d.inert));
    const lineas = await page.$$eval(`${sel.drawer} li`, (l) => l.length);
    check("el panel lista 13 líneas: 11 enteras + media y porción de chocolate", lineas === 13, lineas);
    const esperadoTotal = suma - 70 + 48 + 2 * 10;
    const totalTxt = (await page.textContent(`${sel.drawer} [class*="total"][class*="tnum"]`)).trim();
    check(`total referencial correcto (S/ ${esperadoTotal})`, totalTxt === `S/ ${esperadoTotal}`, totalTxt);
    const chocoLineas = await page.$$eval(`${sel.drawer} li:has-text("Torta de chocolate")`, (ls) => ls.map((l) => l.textContent.replace(/\s+/g, " ")));
    check("el panel muestra el tamaño de cada línea (Entera, Media, Porción)", chocoLineas.length === 3 && chocoLineas[0].includes("Entera") && chocoLineas[1].includes("Media") && chocoLineas[2].includes("Porción") && chocoLineas[2].includes("S/ 20"), chocoLineas.join(" | "));
    check("aviso «mesa de postres a cotizar» visible", await page.isVisible(`${sel.drawer} :text("mesa de postres a cotizar")`));
    await page.click(`${sel.drawer} button[aria-label="Quitar Pastel de acelga, entero del pedido"]`); await page.waitForTimeout(200);
    check("«Quitar» elimina la línea", (await page.$$eval(`${sel.drawer} li`, (l) => l.length)) === 12);
    await page.click(`${sel.drawer} button[aria-label="Agregar uno de Keke de naranja, entero"]`); await page.waitForTimeout(150);
    const sub = await page.$eval(`${sel.drawer} li:has-text("Keke de naranja")`, (li) => li.textContent);
    check("subtotal por línea se actualiza (2 × 26 = S/ 52)", sub.includes("S/ 52"), sub);
    await page.keyboard.press("Escape"); await page.waitForTimeout(400);
    check("Escape cierra el panel", await page.$eval(sel.drawer, (d) => d.inert));
    await ctx.close();
  }

  /* ───────────── 4. Formulario y mensaje de WhatsApp ───────────── */
  group("Pedido por WhatsApp");
  {
    const { ctx, page } = await newPage(browser);
    await agregar(page, "torta-chocolate"); await agregar(page, "torta-chocolate");
    await agregar(page, "torta-chocolate", 3); await agregar(page, "torta-chocolate", 3);
    await agregar(page, "tres-leches", 2);
    await agregar(page, "cheesecake-arandanos");
    await agregar(page, "keke-naranja"); await agregar(page, "keke-naranja"); await agregar(page, "keke-naranja");
    await agregar(page, "mesa-postres");
    await page.click(sel.cartBtn); await page.waitForTimeout(500);

    // Validación
    await page.click(sel.send); await page.waitForTimeout(250);
    check("sin nombre: muestra error y NO abre WhatsApp", (await page.isVisible("#nombre-error")) && page.waOpened.length === 0, page.waOpened.length);
    check("sin nombre: el foco va al campo nombre", (await page.evaluate(() => document.activeElement?.id)) === "pedido-nombre");
    check("el error está asociado al campo (aria-invalid + describedby)", (await page.getAttribute("#pedido-nombre", "aria-invalid")) === "true" && (await page.getAttribute("#pedido-nombre", "aria-describedby")) === "nombre-error");
    await page.fill("#pedido-nombre", "    "); await page.click(sel.send); await page.waitForTimeout(250);
    check("nombre solo con espacios también se rechaza", page.waOpened.length === 0 && (await page.isVisible("#nombre-error")));
    check("fecha mínima = hoy (hora de Lima)", (await page.getAttribute("#pedido-fecha", "min")) === todayLima(), await page.getAttribute("#pedido-fecha", "min"));

    // Datos con caracteres especiales
    const nombre = "María José Ñúñez & Cía <test>";
    await page.fill("#pedido-nombre", nombre);
    await page.fill("#pedido-fecha", "2026-12-24");
    await page.click('[role="radio"]:has-text("Delivery")');
    check("delivery muestra su aviso de costo", await page.isVisible(`${sel.drawer} :text("El costo del delivery lo coordinamos por WhatsApp.")`));
    await page.fill("#pedido-notas", "Sin nueces 🎂\nDedicatoria: ¡Feliz cumple, Ana!");
    const href = await page.getAttribute(sel.send, "href");
    const msg = waText(href);
    const esperado = [
      "Hola Mary, quiero hacer un pedido:",
      "",
      "• 2 × Torta de chocolate · Entera (12 porciones): S/ 170",
      "• 2 × Torta de chocolate · Porción (Individual): S/ 20",
      "• 1 × Tres leches · Media (6 porciones): S/ 40",
      "• 1 × Cheesecake de arándanos · Entero (8 porciones): S/ 85",
      "• 3 × Keke de naranja · Entero (10 tajadas): S/ 78",
      "• 1 × Mesa de postres (Según invitados): a cotizar",
      "",
      "Total referencial: S/ 393 + mesa de postres a cotizar",
      "",
      `Nombre: ${nombre}`,
      "Fecha: 24/12/2026",
      "Entrega: Delivery (por coordinar)",
      "Notas: Sin nueces 🎂\nDedicatoria: ¡Feliz cumple, Ana!",
      "",
      "Quedo atento(a) a la confirmación. ¡Gracias!",
    ].join("\n");
    check("mensaje de WhatsApp idéntico al esperado (productos, subtotales, total, datos)", msg === esperado, "\n--- recibido ---\n" + msg);
    check("número de destino correcto en el enlace", href.startsWith("https://wa.me/51922965377?text="), href.slice(0, 40));
    check("caracteres especiales y emoji viajan bien codificados", msg.includes("Ñúñez & Cía <test>") && msg.includes("🎂"));
    check(`longitud de URL razonable (${href.length} car.)`, href.length < 4000, href.length);

    // Recojo
    await page.click('[role="radio"]:has-text("Recojo")');
    const msgR = waText(await page.getAttribute(sel.send, "href"));
    check("recojo incluye la dirección", msgR.includes("Entrega: Recojo en Av. Simón Bolívar 965, Depto. 1313"), msgR.split("\n").find((l) => l.startsWith("Entrega")));

    // Envío
    await page.click(sel.send); await page.waitForTimeout(700);
    check("al enviar se abre WhatsApp con el pedido", page.waOpened.length === 1 && waText(page.waOpened[0]).includes("Total referencial: S/ 393"), page.waOpened.length);
    check("pantalla de agradecimiento con el primer nombre", await page.isVisible(`${sel.drawer} :text("¡Gracias, María!")`));
    check("enlace «Ábrelo de nuevo» lleva el mismo pedido", waText(await page.getAttribute(`${sel.drawer} a:has-text("Ábrelo de nuevo")`, "href")).includes("S/ 393"));
    await page.click('button:has-text("Volver al pedido")'); await page.waitForTimeout(300);
    check("«Volver al pedido» conserva productos y datos", (await page.$$eval(`${sel.drawer} li`, (l) => l.length)) === 6 && (await page.inputValue("#pedido-nombre")) === nombre);
    await page.click(sel.send); await page.waitForTimeout(400);
    await page.click('button:has-text("Empezar otro pedido")'); await page.waitForTimeout(500);
    check("«Empezar otro pedido» vacía el carrito y cierra el panel", (await badge(page)) === 0 && (await page.$eval(sel.drawer, (d) => d.inert)));
    await page.click(sel.cartBtn); await page.waitForTimeout(400);
    check("panel vacío muestra su mensaje y botón a la carta", await page.isVisible(`${sel.drawer} :text("Tu pedido está vacío")`));
    await page.click(`${sel.drawer} a:has-text("Ver la carta")`); await page.waitForTimeout(500);
    check("«Ver la carta» del panel vacío lo cierra", await page.$eval(sel.drawer, (d) => d.inert));
    check("sin errores durante el flujo", page.errors.length === 0, page.errors.join(" | "));
    await ctx.close();
  }

  /* ───────────── 5. Persistencia ───────────── */
  group("Persistencia");
  {
    const { ctx, page } = await newPage(browser);
    await agregar(page, "pay-limon"); await agregar(page, "pay-limon");
    await page.click(sel.cartBtn); await page.waitForTimeout(300);
    await page.fill("#pedido-nombre", "Rosa"); await page.fill("#pedido-notas", "nota temporal");
    await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(400);
    check("el carrito sobrevive a recargar la página", (await badge(page)) === 2);
    await page.click(sel.cartBtn); await page.waitForTimeout(300);
    check("el nombre se recuerda; las notas no (son de un pedido puntual)", (await page.inputValue("#pedido-nombre")) === "Rosa" && (await page.inputValue("#pedido-notas")) === "");
    await page.evaluate((k) => localStorage.setItem(k, '{"cart":{"no-existe:entera":3,"pay-limon:entera":-1,"keke-platano:media":2.5,"tres-leches:entera":500,"keke-naranja:porcion":2,"keke-naranja:gigante":5},"nombre":{"x":1}}'), LS_KEY);
    await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(400);
    check("datos guardados corruptos se sanean (ids/cantidades inválidas fuera, máx. 99)", (await badge(page)) === 101, await badge(page));
    await page.evaluate((k) => localStorage.setItem(k, "{basura"), LS_KEY);
    await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(400);
    check("JSON inválido no rompe la página", (await badge(page)) === 0 && page.errors.length === 0, page.errors.join(" | "));
    // Migración: un carrito guardado con la versión anterior (un precio por producto) pasa a «entera».
    await page.evaluate(([k, old]) => { localStorage.removeItem(k); localStorage.setItem(old, '{"cart":{"tres-leches":2,"brownies-nueces":1},"nombre":"Rosa"}'); }, [LS_KEY, LEGACY_KEY]);
    await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(400);
    await page.click(sel.cartBtn); await page.waitForTimeout(400);
    const mig = await page.$$eval(`${sel.drawer} li`, (ls) => ls.map((l) => l.textContent.replace(/\s+/g, " ")));
    check("carrito de la versión anterior se migra (tres leches → entera; productos retirados se descartan)", (await badge(page)) === 2 && mig.length === 1 && mig[0].includes("Entera") && (await page.inputValue("#pedido-nombre")) === "Rosa", mig.join(" | "));
    await ctx.close();
  }
  {
    // Modo privado estricto / almacenamiento bloqueado
    const { ctx, page } = await newPage(browser, {}, { init: () => {
      Object.defineProperty(window, "localStorage", { get() { throw new Error("SecurityError: bloqueado"); } });
    } });
    await agregar(page, "tres-leches"); await page.click(sel.cartBtn); await page.waitForTimeout(300);
    await page.fill("#pedido-nombre", "Luis");
    const msg = waText(await page.getAttribute(sel.send, "href"));
    check("con almacenamiento bloqueado (modo privado) igual se puede pedir", (await badge(page)) === 1 && msg.includes("• 1 × Tres leches · Entera") && page.errors.filter((e) => e.startsWith("pageerror")).length === 0, page.errors.join(" | "));
    await ctx.close();
  }

  /* ───────────── 6. Teclado ───────────── */
  group("Teclado");
  {
    const { ctx, page } = await newPage(browser);
    await page.focus(sel.nivel("keke-platano", 3)); await page.keyboard.press("Enter"); await page.waitForTimeout(200);
    check("el «+» de un nivel funciona con Enter", (await badge(page)) === 1);
    await page.focus(sel.cartBtn); await page.keyboard.press("Enter"); await page.waitForTimeout(500);
    check("al abrir el panel el foco entra en él", await page.evaluate(() => !!document.activeElement?.closest("#pedido-drawer")));
    let escapa = false;
    for (let i = 0; i < 25; i++) { await page.keyboard.press("Tab"); if (!(await page.evaluate(() => !!document.activeElement?.closest("#pedido-drawer")))) escapa = true; }
    check("Tab no se escapa del panel (trampa de foco)", !escapa);
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Escape"); await page.waitForTimeout(400);
    check("al cerrar, el foco vuelve a «Mi pedido»", await page.evaluate(() => document.activeElement?.getAttribute("aria-controls") === "pedido-drawer"));
    await page.click(sel.cartBtn); await page.waitForTimeout(400);
    await page.mouse.click(100, 450); await page.waitForTimeout(400);
    check("clic fuera del panel lo cierra", await page.$eval(sel.drawer, (d) => d.inert));
    check("el skip-link «Ir a la carta» existe", (await page.$$("a.skip-link")).length === 1);
    await ctx.close();
  }

  /* ───────────── 7. Dispositivos ───────────── */
  group("Dispositivos");
  for (const [nombre, dev] of [["iPhone SE", devices["iPhone SE"]], ["iPhone 13", devices["iPhone 13"]], ["Pixel 7 (Android)", devices["Pixel 7"]], ["iPad Mini", devices["iPad Mini"]], ["Escritorio 1920", { viewport: { width: 1920, height: 1080 } }]]) {
    const { ctx, page } = await newPage(browser, dev);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(`${nombre}: sin scroll horizontal`, over <= 0, over);
    // Flujo táctil completo usando la barra flotante
    await page.locator(sel.nivel("cheesecake-maracuya", 2)).scrollIntoViewIfNeeded();
    await page.tap(sel.nivel("cheesecake-maracuya", 2)).catch(async () => page.click(sel.nivel("cheesecake-maracuya", 2)));
    if ((await badge(page)) === 0) await page.click(sel.nivel("cheesecake-maracuya", 2));
    await page.waitForTimeout(2200);
    const cajas = await page.evaluate(() => {
      const r = (el) => el && el.getBoundingClientRect();
      return { fab: r(document.querySelector('a[aria-label^="¿Antojo"]')), bar: r(document.querySelector('[class*="barBtn"]')) };
    });
    const choca = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    check(`${nombre}: el botón de WhatsApp no tapa la barra del pedido`, cajas.fab && cajas.bar && !choca(cajas.fab, cajas.bar) && cajas.fab.right <= innerWidthOf(dev), JSON.stringify(cajas));
    await page.click('[class*="barBtn"]'); await page.waitForTimeout(600);
    check(`${nombre}: con el panel abierto el botón de WhatsApp se oculta`, await page.$eval('a[aria-label^="¿Antojo"]', (a) => a.inert));
    await page.fill("#pedido-nombre", "Prueba " + nombre);
    const vis = await page.isVisible(sel.send);
    const inView = await page.$eval(sel.send, (a) => { const r = a.getBoundingClientRect(); return r.bottom <= innerHeight && r.top >= 0; });
    const msg = waText(await page.getAttribute(sel.send, "href"));
    check(`${nombre}: pedido completo desde la barra flotante`, vis && inView && msg.includes("Cheesecake de maracuyá · Medio (4 porciones): S/ 45"), `visible=${vis} enPantalla=${inView}`);
    // Áreas táctiles (WCAG 2.2: mínimo 24×24 px)
    const peq = await page.$$eval("#pedido-drawer button, #pedido-drawer a, #pedido-drawer input, #pedido-drawer textarea", (els) =>
      els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.width < 24 || r.height < 24); }).map((e) => (e.getAttribute("aria-label") || e.textContent || e.id).trim().slice(0, 30)));
    check(`${nombre}: controles del panel ≥ 24 px`, peq.length === 0, peq.join(", "));
    await page.keyboard.press("Escape"); await page.waitForTimeout(400);
    const peqPage = await page.$$eval("header a, header button, #productos button, main a.btn, footer a, a[aria-label^='¿Antojo']", (els) =>
      els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.width < 24 || r.height < 24); }).map((e) => (e.getAttribute("aria-label") || e.textContent).trim().slice(0, 30)));
    check(`${nombre}: botones y enlaces de la página ≥ 24 px`, peqPage.length === 0, peqPage.join(", "));
    check(`${nombre}: sin errores`, page.errors.length === 0, page.errors.join(" | "));
    await ctx.close();
  }

  group("Imágenes responsivas");
  {
    const { ctx, page } = await newPage(browser, devices["Pixel 7"]);
    await page.evaluate(() => document.querySelector("#productos").scrollIntoView());
    await page.waitForTimeout(1200);
    // Móvil: tarjetas a todo el ancho. Lo que importa es no bajar más resolución de la que se muestra.
    const sobre = await page.$$eval("#productos article img", (els) => els.slice(0, 4).map((e) => {
      const m = e.currentSrc.match(/-(\d+)w\.webp$/); const ancho = m ? Number(m[1]) : 800;
      return { f: e.currentSrc.split("/").pop(), ancho, necesario: Math.ceil(e.getBoundingClientRect().width * devicePixelRatio) };
    }));
    check("en móvil las fotos de la carta no bajan más resolución de la necesaria", sobre.every((x) => x.ancho <= Math.max(800, x.necesario * 1.5)), JSON.stringify(sobre));
    const hero = await page.$eval("#inicio img", (e) => e.currentSrc.split("/").pop());
    check("en móvil el hero descarga una variante reducida", /-\d+w\.webp$/.test(hero), hero);
    check("sin imágenes rotas tras el cambio", page.bad.length === 0, page.bad.join(" | "));
    await ctx.close();
    const d = await newPage(browser, { viewport: { width: 1920, height: 1080 } });
    const heroD = await d.page.$eval("#inicio img", (e) => e.currentSrc.split("/").pop());
    await d.page.evaluate(() => document.querySelector("#productos").scrollIntoView()); await d.page.waitForTimeout(1200);
    const cardsD = await d.page.$$eval("#productos article img", (els) => els.slice(0, 3).map((e) => e.currentSrc.split("/").pop()));
    check("en escritorio (3 columnas) las tarjetas bajan la variante reducida", cardsD.every((f) => /-(400|600)w\.webp$/.test(f)), cardsD.join(", "));
    check("en escritorio grande el hero usa la versión completa", heroD === "hero.webp" || /-(1600)w\.webp$/.test(heroD), heroD);
    await d.ctx.close();
  }

  /* ───────────── 8. Accesibilidad (axe-core, WCAG 2.2 AA) ───────────── */
  group("Accesibilidad");
  for (const [nombre, opts, abrir] of [
    ["claro escritorio", {}, false], ["oscuro escritorio", { colorScheme: "dark" }, false],
    ["móvil", devices["iPhone 13"], false], ["panel abierto con productos", {}, true], ["panel abierto, modo oscuro", { colorScheme: "dark" }, true],
  ]) {
    const { ctx, page } = await newPage(browser, { ...opts, reducedMotion: "reduce" });
    if (abrir) { await agregar(page, "tres-leches"); await agregar(page, "tres-leches", 3); await page.click(sel.cartBtn); await page.waitForTimeout(500); }
    await scrollAll(page);
    await page.addScriptTag({ content: AXE });
    const r = await page.evaluate(async (abrir) => {
      const res = await axe.run(abrir ? "#pedido-drawer" : document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } });
      return res.violations.map((v) => `${v.id} (${v.impact}, ${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" ; ")}`);
    }, abrir);
    check(`axe sin violaciones: ${nombre}`, r.length === 0, r.join(" || "));
    await ctx.close();
  }
  {
    const { ctx, page } = await newPage(browser, { reducedMotion: "reduce" });
    const hidden = await page.evaluate(() => [...document.querySelectorAll("h1 span span, h1 em, #productos article, figure")].filter((e) => getComputedStyle(e).opacity !== "1").length);
    check("con «reducir movimiento» todo es visible sin animar", hidden === 0, hidden);
    await ctx.close();
  }

  /* ───────────── 9. SEO y archivos para Netlify ───────────── */
  group("SEO y despliegue");
  {
    const { ctx, page } = await newPage(browser);
    const meta = await page.evaluate(() => ({
      desc: document.querySelector('meta[name="description"]')?.content,
      og: document.querySelector('meta[property="og:image"]')?.content,
      canon: document.querySelector('link[rel="canonical"]')?.href,
      lang: document.documentElement.lang,
      ld: (() => { try { return JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)["@type"]; } catch { return null; } })(),
      h1: document.querySelectorAll("h1").length,
    }));
    check("meta description presente", !!meta.desc && meta.desc.includes("Tortas, cheesecakes"), meta.desc);
    check("imagen para compartir (Open Graph)", !!meta.og, meta.og);
    check("idioma es-PE y un solo H1", meta.lang === "es-PE" && meta.h1 === 1, JSON.stringify(meta));
    check("datos estructurados de panadería válidos", meta.ld === "Bakery", meta.ld);
    for (const f of ["robots.txt", "sitemap.xml", "og.png", "icon.svg", "apple-icon.png"]) {
      const r = await page.request.get(BASE + f);
      check(`/${f} disponible`, r.status() === 200, r.status());
    }
    check("página 404 generada para Netlify", fs.existsSync(path.join(OUT, "404.html")) && fs.statSync(path.join(OUT, "404.html")).size > 1000);
    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(__dirname, "resultados.json"), JSON.stringify(results, null, 2));
  const fails = results.filter((r) => !r.ok);
  console.log(`\nTOTAL ${results.length}  PASS ${results.length - fails.length}  FAIL ${fails.length}`);
  process.exitCode = fails.length ? 1 : 0;
})();
