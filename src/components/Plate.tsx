import Image from "next/image";
import type { CSSProperties } from "react";
import styles from "./Plate.module.css";

interface PlateProps {
  src?: string;
  alt: string;
  /** Relación de aspecto CSS, p. ej. "4 / 5". */
  ratio: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Marco de foto «plate» del sistema de diseño.
 * Mientras no haya foto real muestra un placeholder elegante (no una imagen rota).
 */
export function Plate({ src, alt, ratio, sizes, priority, className, style }: PlateProps) {
  return (
    <div className={`plate ${className ?? ""}`} style={{ aspectRatio: ratio, ...style }}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />
      ) : (
        <div className={styles.placeholder} role="img" aria-label={alt}>
          <span className={styles.mark} aria-hidden="true">
            <span>
              M<em>b</em>
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
