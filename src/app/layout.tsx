import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
// Fuentes auto-alojadas (Fontsource): sin peticiones a Google en tiempo de ejecución,
// build determinista y mejor privacidad. Solo el subconjunto latino y los pesos usados.
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/cormorant-garamond/latin-600.css";
import "@fontsource/lora/latin-400.css";
import "@fontsource/lora/latin-400-italic.css";
import "./globals.css";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.titulo,
  description: SITE.descripcion,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "/",
    siteName: SITE.nombre,
    title: SITE.titulo,
    description: SITE.descripcion,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE.titulo }],
  },
  twitter: { card: "summary_large_image", title: SITE.titulo, description: SITE.descripcion, images: ["/og.png"] },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f3f2f2",
  width: "device-width",
  initialScale: 1,
};

/** Datos estructurados para Google (ficha de negocio local). */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: SITE.nombre,
  description: SITE.descripcion,
  url: SITE.url,
  telephone: `+${SITE.codigoPais}${SITE.whatsapp}`,
  priceRange: "S/",
  address: { "@type": "PostalAddress", streetAddress: SITE.direccion, addressCountry: "PE" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-PE">
      <body>
        <script
          type="application/ld+json"
          // JSON generado desde constantes propias (no entrada de usuario); se escapa '<' por seguridad.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
