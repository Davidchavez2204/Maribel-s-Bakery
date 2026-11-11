import { About } from "@/components/About";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Catalog } from "@/components/Catalog";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowToOrder } from "@/components/HowToOrder";
import { OrderBar } from "@/components/OrderBar";
import { OrderDrawer } from "@/components/OrderDrawer";
import { RevealObserver } from "@/components/RevealObserver";
import { Toast } from "@/components/Toast";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { OrderProvider } from "@/context/OrderContext";

/**
 * Página única. Las secciones estáticas (AnnouncementBar, Hero, HowToOrder, About, Footer)
 * son Server Components: se pre-renderizan a HTML y no envían JS al navegador.
 * Solo lo interactivo (carta, carrito, panel) es Client Component.
 */
export default function Home() {
  return (
    <OrderProvider>
      <a href="#productos" className="skip-link">Ir a la carta</a>
      <AnnouncementBar />
      <Header />
      <main>
        <Hero />
        <Catalog />
        <HowToOrder />
        <About />
      </main>
      <Footer />
      <WhatsAppFab />
      <OrderBar />
      <Toast />
      <OrderDrawer />
      <RevealObserver />
    </OrderProvider>
  );
}
