import { reveal } from "@/lib/reveal";
import styles from "./HowToOrder.module.css";

/** Es una secuencia real (el orden importa), por eso los pasos van numerados y unidos por una línea. */
const PASOS = [
  { title: "Elige tus postres", text: "Revisa la carta y presiona «Separar» en lo que te provoque." },
  { title: "Cuéntame para cuándo", text: "Escribe tu nombre, la fecha y si recoges o prefieres delivery." },
  { title: "Confírmalo por WhatsApp", text: "Me llega tu pedido con todo el detalle y te confirmo el total y la entrega." },
];

export function HowToOrder() {
  return (
    <section id="como-pedir" className={styles.section} aria-labelledby="como-pedir-title">
      <div className={`container ${styles.inner}`}>
        <h2 id="como-pedir-title" className={styles.h2} {...reveal(0)}>
          Pedir es <em>así de fácil</em>
        </h2>
        <ol className={styles.steps}>
          {PASOS.map((p, i) => (
            <li key={p.title} className={styles.step} {...reveal(i * 120)}>
              <span className={styles.num} aria-hidden="true">{i + 1}</span>
              <h3 className={styles.title}>{p.title}</h3>
              <p className={styles.text}>{p.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
