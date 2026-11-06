import { Catalog } from "@/components/Catalog";
import { Catering } from "@/components/Catering";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowToOrder } from "@/components/HowToOrder";
import { OrderBar } from "@/components/OrderBar";
import { OrderDrawer } from "@/components/OrderDrawer";
import { RevealObserver } from "@/components/RevealObserver";
import { Toast } from "@/components/Toast";
import { TrustStrip } from "@/components/TrustStrip";
import { OrderProvider } from "@/context/OrderContext";

/**
 * Página única. Las secciones estáticas (Hero, TrustStrip, HowToOrder, Catering, Footer)
 * son Server Components: se pre-renderizan a HTML y no envían JS al navegador.
 * Solo lo interactivo (carta, carrito, panel) es Client Component.
 */
export default function Home() {
  return (
    <OrderProvider>
      <a href="#productos" className="skip-link">Ir a la carta</a>
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <Catalog />
        <HowToOrder />
        <Catering />
      </main>
      <Footer />
      <OrderBar />
      <Toast />
      <OrderDrawer />
      <RevealObserver />
    </OrderProvider>
  );
}
