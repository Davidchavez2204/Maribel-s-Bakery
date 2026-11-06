import { MessageCircle } from "lucide-react";
import { FOTOS } from "@/data/productos";
import { reveal } from "@/lib/reveal";
import { WA_CONSULTA } from "@/lib/whatsapp";
import { Plate } from "./Plate";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section id="inicio" className={`container ${styles.hero}`} aria-labelledby="hero-title">
      <div className={styles.text}>
        <p className="kicker" {...reveal(0)}>Repostería casera</p>
        <h1 id="hero-title" className={styles.title} {...reveal(80)}>
          Postres de primera calidad, <em>al alcance de tu mano.</em>
        </h1>
        <p className={styles.lead} {...reveal(160)}>
          Pasteles, pays, cupcakes y brownies hechos por encargo. Elige tus postres, sepáralos en tu pedido y
          confírmalo directamente con Maribel por WhatsApp.
        </p>
        <div className={styles.ctas} {...reveal(240)}>
          <a href="#productos" className="btn btn-primary btn-lg">Ver productos</a>
          <a href={WA_CONSULTA} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-lg">
            <MessageCircle size={18} strokeWidth={1.5} aria-hidden="true" />
            Escribir por WhatsApp
          </a>
        </div>
      </div>
      <div className={styles.media} {...reveal(120)}>
        <Plate
          src={FOTOS.hero}
          alt="Pastel artesanal de Maribel's Bakery"
          ratio="4 / 5"
          sizes="(max-width: 900px) 100vw, 500px"
          priority
        />
      </div>
    </section>
  );
}
