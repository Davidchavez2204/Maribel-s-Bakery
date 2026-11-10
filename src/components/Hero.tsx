import { MessageCircle } from "lucide-react";
import { FOTOS } from "@/data/productos";
import { reveal } from "@/lib/reveal";
import { WA_CONSULTA } from "@/lib/whatsapp";
import { Sello } from "./Logo";
import { Plate } from "./Plate";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section id="inicio" className={`container ${styles.hero}`} aria-labelledby="hero-title">
      <div className={styles.text}>
        <h1 id="hero-title" className={styles.title} {...reveal(0)}>
          Postres hechos con amor,<br /> <em>para cada ocasión.</em>
        </h1>
        <p className={styles.lead} {...reveal(90)}>
          Pasteles, pays, cupcakes y brownies con recetas de familia. Elige los tuyos y confírmalos conmigo por WhatsApp.
        </p>
        <div className={styles.ctas} {...reveal(180)}>
          <a href="#productos" className="btn btn-primary">Ver la carta</a>
          <a href={WA_CONSULTA} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            <MessageCircle size={18} strokeWidth={1.5} aria-hidden="true" />
            Escríbeme por WhatsApp
          </a>
        </div>
      </div>

      <div className={styles.media} {...reveal(120)}>
        <Plate
          src={FOTOS.hero}
          alt="Un postre recién hecho en la cocina de Maribel"
          ratio="4 / 5"
          sizes="(max-width: 900px) 100vw, 460px"
          priority
        />
        {/* El sello como sticker de caja (aplicación del manual): firma de la marca sobre la foto. */}
        <div className={styles.sticker} aria-hidden="true">
          <Sello id="sello-hero" size="100%" />
        </div>
      </div>
    </section>
  );
}
