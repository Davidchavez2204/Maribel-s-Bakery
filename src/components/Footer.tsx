import { MessageCircle } from "lucide-react";
import { SITE } from "@/config/site";
import { WA_CONSULTA } from "@/lib/whatsapp";
import { Sello } from "./Logo";
import styles from "./Footer.module.css";

/** Cierre en Cacao con el sello en Miel: la combinación que el manual indica para fondos oscuros. */
export function Footer() {
  return (
    <footer id="contacto" className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Sello id="sello-footer" size={148} title="Maribel's Bakery, hecho en casa con amor" className={styles.sello} />
          <p className={styles.tagline}>{SITE.tagline}</p>
        </div>

        <div className={styles.col}>
          <h2 className={styles.label}>Pedidos y consultas</h2>
          <a href={WA_CONSULTA} target="_blank" rel="noopener noreferrer" className={`${styles.phone} tnum`}>
            {SITE.telefonoVisible}
          </a>
          <p className={styles.small}>WhatsApp y llamadas</p>
          <a href={WA_CONSULTA} target="_blank" rel="noopener noreferrer" className={styles.wa}>
            <MessageCircle size={18} strokeWidth={1.5} aria-hidden="true" />
            Escríbeme por WhatsApp
          </a>
        </div>

        <div className={styles.col}>
          <h2 className={styles.label}>Dirección</h2>
          <address className={styles.address}>{SITE.direccion}</address>
        </div>
      </div>

      <div className={`container ${styles.legal}`}>
        <span>© {new Date().getFullYear()} {SITE.nombre}</span>
        <span>Hecho en casa, con amor.</span>
      </div>
    </footer>
  );
}
