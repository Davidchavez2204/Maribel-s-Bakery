import { reveal } from "@/lib/reveal";
import styles from "./HowToOrder.module.css";

const PASOS = [
  { n: "01", title: "Elige tus postres", text: "Revisa la carta y presiona «Separar» en lo que te guste." },
  { n: "02", title: "Completa tu pedido", text: "Indica tu nombre, la fecha que lo necesitas y si recoges o prefieres delivery." },
  { n: "03", title: "Confirma por WhatsApp", text: "Se abre un mensaje con todo el detalle. Maribel te responde para confirmar total y entrega." },
];

export function HowToOrder() {
  return (
    <section id="como-pedir" className={styles.section} aria-labelledby="como-pedir-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.head} {...reveal(0)}>
          <p className={`kicker ${styles.kicker}`}>Cómo pedir</p>
          <h2 id="como-pedir-title" className={styles.h2}>Tres pasos, sin complicaciones</h2>
        </div>
        <ol className={styles.steps}>
          {PASOS.map((p, i) => (
            <li key={p.n} className={styles.step} {...reveal(i * 120)}>
              <span className={`${styles.num} tnum`} aria-hidden="true">{p.n}</span>
              <h3 className={styles.title}>{p.title}</h3>
              <p className={styles.text}>{p.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
