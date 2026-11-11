import { SITE } from "@/config/site";
import { WA_PEDIDO } from "@/lib/whatsapp";
import styles from "./AnnouncementBar.module.css";

/** Franja superior (patrón de tienda de la referencia): la información que más preguntan. */
export function AnnouncementBar() {
  return (
    <div className={styles.bar}>
      <p className={`container ${styles.inner}`}>
        <span>Todo se prepara por encargo, para tu fecha.</span>
        <span className={styles.sep} aria-hidden="true" />
        <span>
          Pedidos por WhatsApp al{" "}
          <a href={WA_PEDIDO} target="_blank" rel="noopener noreferrer" className="tnum">
            {SITE.telefonoVisible}
          </a>
        </span>
      </p>
    </div>
  );
}
