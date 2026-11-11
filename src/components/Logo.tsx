/**
 * Logos oficiales (manual de marca de Mary's Bakery, «El sello de casa»), convertidos a componentes:
 * - usan currentColor → un solo SVG sirve en Canela (claro), Miel (oscuro) o blanco.
 * - el texto usa las fuentes ya cargadas por la página (Cormorant 500 + Lora cursiva).
 * Reglas del manual: sello completo desde 64 px; por debajo, usar el monograma.
 */

interface SelloProps {
  /** Prefijo único: dos sellos en la misma página no pueden compartir ids de <path>. */
  id: string;
  size?: number | string;
  className?: string;
  title?: string;
}

function SelloShapes({ id }: { id: string }) {
  return (
    <>
      <g fill="none" stroke="currentColor">
        <circle cx="150" cy="150" r="142" strokeWidth="2" />
        <circle cx="150" cy="150" r="134" strokeWidth="0.8" />
        <circle cx="150" cy="150" r="98" strokeWidth="0.8" />
      </g>
      <path id={`${id}-t`} d="M 42,150 A 108,108 0 0 1 258,150" fill="none" />
      <path id={`${id}-b`} d="M 28,150 A 122,122 0 0 0 272,150" fill="none" />
      <text fill="currentColor" fontFamily="'Cormorant Garamond'" fontWeight="500" fontSize="24" letterSpacing="6">
        <textPath href={`#${id}-t`} startOffset="50%" textAnchor="middle">MARY&apos;S BAKERY</textPath>
      </text>
      <text fill="currentColor" fontFamily="'Lora'" fontSize="12.5" letterSpacing="3">
        <textPath href={`#${id}-b`} startOffset="50%" textAnchor="middle">HECHO EN CASA · CON AMOR</textPath>
      </text>
      <rect x="31" y="146" width="7" height="7" fill="currentColor" transform="rotate(45 34.5 149.5)" />
      <rect x="262" y="146" width="7" height="7" fill="currentColor" transform="rotate(45 265.5 149.5)" />
      <text x="150" y="182" textAnchor="middle" fill="currentColor" fontFamily="'Cormorant Garamond'" fontStyle="italic" fontSize="112">M</text>
      <text x="150" y="212" textAnchor="middle" fill="currentColor" fontFamily="'Lora'" fontStyle="italic" fontSize="15">de mamá</text>
    </>
  );
}

export function Sello({ id, size = 160, className, title }: SelloProps) {
  return (
    <svg
      viewBox="0 0 300 300"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <SelloShapes id={id} />
    </svg>
  );
}

export function Monograma({ size = 40, className }: { size?: number | string; className?: string }) {
  return (
    <svg viewBox="0 0 300 300" width={size} height={size} className={className} aria-hidden="true">
      <circle cx="150" cy="150" r="140" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="150" cy="150" r="128" fill="none" stroke="currentColor" strokeWidth="1" />
      <text x="150" y="205" textAnchor="middle" fill="currentColor" fontFamily="'Cormorant Garamond'" fontStyle="italic" fontSize="190">M</text>
    </svg>
  );
}

/** Logo horizontal (sello + nombre). `compact` cambia el sello por el monograma (tamaños < 64 px). */
export function LogoHorizontal({ id, height = 64, compact = false, className }: { id: string; height?: number; compact?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 720 300" height={height} width={(height * 720) / 300} className={className} aria-hidden="true">
      {compact ? (
        <g>
          <circle cx="150" cy="150" r="140" fill="none" stroke="currentColor" strokeWidth="5" />
          <circle cx="150" cy="150" r="124" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="150" y="205" textAnchor="middle" fill="currentColor" fontFamily="'Cormorant Garamond'" fontStyle="italic" fontSize="190">M</text>
        </g>
      ) : (
        <SelloShapes id={id} />
      )}
      <text x="340" y="168" fill="currentColor" fontFamily="'Cormorant Garamond'" fontSize="118">Mary&apos;s</text>
      <text x="345" y="242" fill="currentColor" fontFamily="'Cormorant Garamond'" fontStyle="italic" fontSize="72">Bakery</text>
    </svg>
  );
}
