import { SITE } from "@/config/site";
import { reveal } from "@/lib/reveal";
import { Monograma } from "./Logo";
import styles from "./About.module.css";

/** Promesas tomadas del manual de marca (personalidad y tono). */
const PROMESAS = ["Recetas de familia, con sabor de casa", "Porciones de verdad", "Si tienes alguna alergia, cuéntame y lo adaptamos"];

export function About() {
  return (
    <section id="nosotros" className={`container ${styles.section}`} aria-labelledby="nosotros-title">
      <h2 id="nosotros-title" className={styles.h2} {...reveal(0)}>
        La repostería de <em>una mamá</em>
      </h2>
      <p className={styles.lead} {...reveal(80)}>
        Cocino para ti como cocino para mi familia: con buenos ingredientes, sin apuro y pensando en quién lo va a
        disfrutar.
      </p>

      {/* La tarjeta de agradecimiento que va dentro de cada caja (aplicación del manual). */}
      <figure className={styles.card}>
        <Monograma size={44} className={styles.mono} />
        <blockquote className={styles.quote}>
          <p>{SITE.gracias}</p>
        </blockquote>
        <figcaption className={styles.sign}>Maribel</figcaption>
      </figure>

      <ul className={styles.promises} {...reveal(220)}>
        {PROMESAS.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </section>
  );
}
