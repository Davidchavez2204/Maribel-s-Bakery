import styles from "./Brand.module.css";

/** Marca tipográfica (no hay logo): «Maribel's» + «Bakery» en cursiva. */
export function Brand({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className={`${styles.brand} ${size === "lg" ? styles.lg : ""}`}>
      <span className={styles.name}>Maribel&apos;s</span>
      <span className={styles.sub}>Bakery</span>
    </span>
  );
}
