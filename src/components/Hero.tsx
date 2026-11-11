import Image from "next/image";
import type { CSSProperties } from "react";
import { ArrowDown, MessageCircle } from "lucide-react";
import { FOTOS } from "@/data/productos";
import { WA_CONSULTA } from "@/lib/whatsapp";
import { HeroParallax } from "./HeroParallax";
import { Sello } from "./Logo";
import styles from "./Hero.module.css";

/** Retraso de entrada (variable CSS --d). */
const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * Hero a sangre completa: foto + degradado Cacao (el contraste del texto no depende de la foto).
 * Movimiento (todo desactivado con «reducir movimiento»):
 * - entrada: el titular sube línea por línea, luego el texto y los botones;
 * - la foto se desplaza con el scroll (CSS scroll-driven) y con el puntero (HeroParallax);
 * - el sello «estampa» al cargar y gira suavemente al bajar.
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
        <HeroParallax className={styles.layer}>
          {foto ? (
            <Image
              src={foto}
              alt=""
              fill
              priority
              // Next 16: `priority` precarga, pero la prioridad de red la fija fetchPriority.
              fetchPriority="high"
              loading="eager"
              // En móvil la foto es una franja de ~390×250 px: no hace falta la versión 3x.
              sizes="(max-width: 760px) 60vw, 100vw"
              className={styles.photo}
              style={{ objectPosition: FOTOS.heroPosicion }}
            />
          ) : (
            <Sello id="sello-hero-bg" size="100%" className={styles.watermark} />
          )}
        </HeroParallax>
        <div className={styles.overlay} />
        {/* Destellos cálidos que flotan: la luz de la cocina. */}
        <div className={styles.glints}>
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} style={{ "--i": i } as CSSProperties} />
          ))}
        </div>
      </div>

      <div className={`container ${styles.inner}`}>
        <div className={styles.text}>
          <p className={`${styles.kicker} ${styles.in}`} style={d(0)}>
            Repostería hecha en casa
          </p>
          <h1 id="hero-title" className={styles.title}>
            <span className={styles.line}>
              <span style={d(120)}>Postres hechos con amor,</span>
            </span>
            <span className={styles.line}>
              <em style={d(260)}>para cada ocasión.</em>
            </span>
          </h1>
          <p className={`${styles.lead} ${styles.in}`} style={d(460)}>
            Tortas, cheesecakes, kekes y pays con recetas de familia. Elige los tuyos y confírmalos conmigo por
            WhatsApp.
          </p>
          <div className={`${styles.ctas} ${styles.in}`} style={d(580)}>
            <a href="#productos" className={`btn ${styles.ctaPrimary}`}>
              Ver la carta
              <ArrowDown size={16} strokeWidth={1.5} aria-hidden="true" className={styles.arrow} />
            </a>
            <a href={WA_CONSULTA} target="_blank" rel="noopener noreferrer" className={`btn ${styles.ctaGhost}`}>
              <MessageCircle size={18} strokeWidth={1.5} aria-hidden="true" />
              Escríbeme por WhatsApp
            </a>
          </div>
        </div>

        {/* El sello en Miel sobre fondo oscuro, como indica el manual. */}
        <div className={styles.seal} aria-hidden="true">
          <div className={styles.sealSpin}>
            <Sello id="sello-hero" size="100%" />
          </div>
        </div>
      </div>
    </section>
  );
}
