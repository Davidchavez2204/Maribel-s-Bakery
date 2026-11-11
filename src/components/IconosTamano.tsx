import type { Tamano } from "@/data/productos";

/**
 * Íconos de tamaño: torta entera, media torta y porción.
 * Se dibujan a mano porque ninguna librería trae «media torta», y mezclar estilos rompería la familia;
 * mismo lenguaje que lucide (grilla 24, trazo 1.5, extremos redondeados, currentColor).
 */
interface Props {
  size?: number;
  className?: string;
}

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Torta entera: cilindro con una capa de relleno y una fresa encima. */
export function IconoEntera({ size = 24, className }: Props) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <ellipse cx="12" cy="9" rx="8" ry="3" />
      <path d="M4 9v7c0 1.66 3.58 3 8 3s8-1.34 8-3V9" />
      <path d="M4 12.5c0 1.66 3.58 3 8 3s8-1.34 8-3" />
      <path d="M12 6V4.5" />
      <circle cx="12" cy="3.6" r="0.9" />
    </svg>
  );
}

/** Media torta: el corte de frente (se ve el relleno) y media tapa detrás. */
export function IconoMedia({ size = 24, className }: Props) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M4 10a8 3 0 0 1 16 0" />
      <path d="M4 10h16v8H4z" />
      <path d="M4 13.5h16" />
    </svg>
  );
}

/** Porción: cuña con su capa de relleno. */
export function IconoPorcion({ size = 24, className }: Props) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M4 12L20 7v5" />
      <path d="M4 12h16v6H4z" />
      <path d="M4 15h16" />
    </svg>
  );
}

export function IconoTamano({ tamano, ...props }: Props & { tamano: Tamano }) {
  if (tamano === "media") return <IconoMedia {...props} />;
  if (tamano === "porcion") return <IconoPorcion {...props} />;
  return <IconoEntera {...props} />;
}
