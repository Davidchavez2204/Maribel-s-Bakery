import { Heart, MessageCircle, ShieldCheck, type LucideIcon } from "lucide-react";
import { reveal } from "@/lib/reveal";
import styles from "./TrustStrip.module.css";

const ITEMS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Heart, title: "Hecho por encargo", text: "Cada postre se prepara para tu fecha, con ingredientes frescos." },
  { icon: ShieldCheck, title: "Sin pagos en línea", text: "Aquí no se cobra nada. Precio y entrega se confirman contigo." },
  { icon: MessageCircle, title: "Trato directo", text: "Tu pedido llega al WhatsApp de Maribel, sin intermediarios." },
];

export function TrustStrip() {
  return (
    <section className={styles.strip} aria-label="Por qué pedir con nosotros">
      <ul className={`container ${styles.grid}`}>
        {ITEMS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className={styles.item} {...reveal(i * 100)}>
            <Icon size={28} strokeWidth={1.3} color="var(--color-accent)" aria-hidden="true" className={styles.icon} />
            <div className={styles.copy}>
              <h2 className={styles.title}>{title}</h2>
              <p className={styles.text}>{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
