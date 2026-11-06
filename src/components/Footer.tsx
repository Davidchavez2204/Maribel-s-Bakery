import { SITE } from "@/config/site";
import { WA_CONSULTA } from "@/lib/whatsapp";
import { Brand } from "./Brand";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer id="contacto" className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.col}>
          <Brand size="lg" />
          <p className={styles.tagline}>{SITE.tagline}</p>
        </div>
        <div className={styles.col}>
          <h2 className={styles.label}>WhatsApp · Llamadas</h2>
          <a href={WA_CONSULTA} target="_blank" rel="noopener noreferrer" className={`${styles.phone} tnum`}>
            {SITE.telefonoVisible}
          </a>
        </div>
        <div className={styles.col}>
          <h2 className={styles.label}>Dirección</h2>
          <address className={styles.address}>{SITE.direccion}</address>
        </div>
      </div>
      <div className={`container ${styles.legal}`}>© {new Date().getFullYear()} {SITE.nombre}</div>
    </footer>
  );
}
