import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { FOTOS } from "@/data/productos";
import { reveal } from "@/lib/reveal";
import { WA_CONSULTA } from "@/lib/whatsapp";
import { Sello } from "./Logo";
import styles from "./Hero.module.css";

/**
 * Hero a sangre completa: foto de fondo + degradado Cacao que garantiza el contraste del texto
 * sin importar la foto. Sin foto, cae a un fondo Cacao con luz cálida y el sello como marca de agua.
 */
export function Hero() {
  const foto = FOTOS.hero;

  return (
    <section
      id="inicio"
      className={`${styles.hero} ${foto ? styles.withPhoto : styles.noPhoto}`}
      aria-labelledby="hero-title"
    >
      <div className={styles.bg} aria-hidden="true">
        {foto ? (
          <Image
            src={foto}
            alt=""
            fill
            priority
            sizes="100vw"
            className={styles.photo}
            style={{ objectPosition: FOTOS.heroPosicion }}
          />
        ) : (
          <Sello id="sello-hero-bg" size="100%" className={styles.watermark} />
        )}
        <div className={styles.overlay} />
      </div>

      <div className={`container ${styles.inner}`}>
        <div className={styles.text}>
          <p className={styles.kicker} {...reveal(0)}>Repostería hecha en casa</p>
          <h1 id="hero-title" className={styles.title} {...reveal(80)}>
            Postres hechos con amor,<br /> <em>para cada ocasión.</em>
          </h1>
          <p className={styles.lead} {...reveal(160)}>
            Pasteles, pays, cupcakes y brownies con recetas de familia. Elige los tuyos y confírmalos conmigo por
            WhatsApp.
          </p>
          <div className={styles.ctas} {...reveal(240)}>
            <a href="#productos" className={`btn ${styles.ctaPrimary}`}>Ver la carta</a>
            <a href={WA_CONSULTA} target="_blank" rel="noopener noreferrer" className={`btn ${styles.ctaGhost}`}>
              <MessageCircle size={18} strokeWidth={1.5} aria-hidden="true" />
              Escríbeme por WhatsApp
            </a>
          </div>
        </div>

        {/* El sello en Miel sobre fondo oscuro, como indica el manual. */}
        <div className={styles.seal} aria-hidden="true">
          <Sello id="sello-hero" size="100%" />
        </div>
      </div>
    </section>
  );
}
