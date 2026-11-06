import { MessageCircle } from "lucide-react";
import { FOTOS } from "@/data/productos";
import { reveal } from "@/lib/reveal";
import { WA_CATERING } from "@/lib/whatsapp";
import { Plate } from "./Plate";
import styles from "./Catering.module.css";

export function Catering() {
  return (
    <section className={`container ${styles.section}`} aria-labelledby="catering-title">
      <div {...reveal(0)}>
        <Plate src={FOTOS.catering} alt="Mesa de postres para eventos" ratio="3 / 2" sizes="(max-width: 900px) 100vw, 560px" />
      </div>
      <div className={styles.copy} {...reveal(120)}>
        <p className="kicker">Catering y encargos</p>
        <h2 id="catering-title" className={styles.h2}>Mesas de postres para cumpleaños, bautizos y reuniones</h2>
        <p className={styles.text}>
          Cuéntanos la fecha, el número de invitados y la temática. Armamos una propuesta a tu medida, con postres
          personalizados.
        </p>
        <div>
          <a href={WA_CATERING} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
            <MessageCircle size={18} strokeWidth={1.5} aria-hidden="true" />
            Cotizar mi evento
          </a>
        </div>
      </div>
    </section>
  );
}
