import Image from "next/image";
import { Monograma } from "./Logo";
import styles from "./Plate.module.css";

interface PlateProps {
  src?: string;
  alt: string;
  /** Relación de aspecto CSS, p. ej. "4 / 5". */
  ratio: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/**
 * Marco de foto. Sin foto real muestra un fondo Masa con el monograma de la marca
 * como marca de agua (uso que el manual permite al monograma), nunca una imagen rota.
 */
export function Plate({ src, alt, ratio, sizes, priority, className }: PlateProps) {
  return (
    <div className={`${styles.plate} ${className ?? ""}`} style={{ aspectRatio: ratio }}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={styles.img} />
      ) : (
        <div className={styles.placeholder} role="img" aria-label={alt}>
          <Monograma className={styles.mark} size="34%" />
        </div>
      )}
    </div>
  );
}
