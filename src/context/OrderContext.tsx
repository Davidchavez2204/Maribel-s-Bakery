"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { clave, OPCIONES_POR_CLAVE, PRODUCTOS, PRODUCTOS_POR_ID, type Filtro } from "@/data/productos";
import { describirLinea, type Entrega, type LineaPedido } from "@/lib/whatsapp";

const STORAGE_KEY = "marys_pedido_v2";
/** Versión anterior (un precio por producto, clave = id). Se migra una sola vez. */
const LEGACY_KEY = "maribels_pedido_v1";
const MAX_QTY = 99;

/** clave `producto:tamaño` → cantidad */
type Cart = Readonly<Record<string, number>>;

interface State {
  cart: Cart;
  nombre: string;
  fecha: string;
  entrega: Entrega;
  notas: string;
  /** El usuario ya abrió WhatsApp; se reinicia si modifica el carrito. */
  sent: boolean;
}

type Action =
  | { type: "hydrate"; cart: Cart; nombre: string }
  | { type: "setQty"; id: string; qty: number }
  | { type: "field"; field: "nombre" | "fecha" | "notas"; value: string }
  | { type: "entrega"; value: Entrega }
  | { type: "sent"; value: boolean }
  | { type: "reset" };

const initialState: State = { cart: {}, nombre: "", fecha: "", entrega: "recojo", notas: "", sent: false };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { ...state, cart: action.cart, nombre: action.nombre };
    case "setQty": {
      const cart = { ...state.cart };
      const qty = Math.min(Math.max(0, Math.trunc(action.qty)), MAX_QTY);
      if (qty === 0) delete cart[action.id];
      else cart[action.id] = qty;
      return { ...state, cart, sent: false };
    }
    case "field":
      return { ...state, [action.field]: action.value };
    case "entrega":
      return { ...state, entrega: action.value };
    case "sent":
      return { ...state, sent: action.value };
    case "reset":
      // Se conserva el nombre (dato persistido para el próximo pedido) y la preferencia de entrega.
      return { ...state, cart: {}, fecha: "", notas: "", sent: false };
  }
}

/**
 * Lee y SANEA lo guardado: localStorage es entrada no confiable
 * (puede estar corrupto, ser de una versión vieja o editado a mano).
 */
function readStorage(): { cart: Cart; nombre: string } | null {
  try {
    let raw = window.localStorage.getItem(STORAGE_KEY);
    let legacy = false;
    if (!raw) {
      raw = window.localStorage.getItem(LEGACY_KEY);
      legacy = raw !== null;
    }
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    const { cart, nombre } = data as { cart?: unknown; nombre?: unknown };
    const clean: Record<string, number> = {};
    if (typeof cart === "object" && cart !== null) {
      for (const [k, q] of Object.entries(cart)) {
        // v1 guardaba solo el id del producto: equivale a su primer tamaño (la entera).
        const key = legacy ? migrarClave(k) : k;
        if (key && OPCIONES_POR_CLAVE.has(key) && Number.isInteger(q) && (q as number) > 0) {
          clean[key] = Math.min((clean[key] ?? 0) + (q as number), MAX_QTY);
        }
      }
    }
    return { cart: clean, nombre: typeof nombre === "string" ? nombre.slice(0, 80) : "" };
  } catch {
    return null;
  }
}

function migrarClave(id: string): string | null {
  const p = PRODUCTOS_POR_ID.get(id);
  const primera = p?.opciones[0];
  return p && primera ? clave(p.id, primera.tamano) : null;
}

interface OrderContextValue extends State {
  lineas: LineaPedido[];
  count: number;
  open: boolean;
  toast: string | null;
  bump: boolean;
  /** Unidades de un producto sumando todos sus tamaños (para el sello «separado»). */
  qtyProducto: (id: string) => number;
  /** Agrega 1 unidad de una clave `producto:tamaño`; toast y bump solo si era nueva. */
  add: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  setField: (field: "nombre" | "fecha" | "notas", value: string) => void;
  setEntrega: (value: Entrega) => void;
  setSent: (value: boolean) => void;
  reset: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  /** Categoría activa de la carta (compartida entre el header y la carta). */
  filtro: Filtro;
  setFiltro: (f: Filtro) => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [bump, setBump] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const bumpTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 1) Hidratar desde localStorage (solo en cliente, tras el primer render, para no romper la hidratación de React).
  useEffect(() => {
    const saved = readStorage();
    if (saved) dispatch({ type: "hydrate", ...saved });
    setHydrated(true);
  }, []);

  // 2) Persistir carrito + nombre (nunca fecha/notas: son de un pedido puntual).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart: state.cart, nombre: state.nombre }));
    } catch {
      /* modo privado / cuota llena: el sitio sigue funcionando sin persistencia */
    }
  }, [hydrated, state.cart, state.nombre]);

  useEffect(
    () => () => {
      clearTimeout(toastTimer.current);
      clearTimeout(bumpTimer.current);
    },
    [],
  );

  const setQty = useCallback((id: string, qty: number) => dispatch({ type: "setQty", id, qty }), []);

  const add = useCallback((key: string) => {
    const current = state.cart[key] ?? 0;
    dispatch({ type: "setQty", id: key, qty: current + 1 });
    if (current === 0) {
      const item = OPCIONES_POR_CLAVE.get(key);
      clearTimeout(toastTimer.current);
      clearTimeout(bumpTimer.current);
      setToast(`${item ? describirLinea(item).replace(/ \(.*\)$/, "") : "Tu postre"} ya está en tu pedido`);
      setBump(true);
      bumpTimer.current = setTimeout(() => setBump(false), 220);
      toastTimer.current = setTimeout(() => setToast(null), 2200);
    }
  }, [state.cart]);

  const value = useMemo<OrderContextValue>(() => {
    // Respeta el orden de la carta (producto y luego tamaño), no el orden de inserción.
    const lineas: LineaPedido[] = PRODUCTOS.flatMap((producto) =>
      producto.opciones.flatMap((opcion) => {
        const key = clave(producto.id, opcion.tamano);
        const qty = state.cart[key] ?? 0;
        return qty > 0 ? [{ key, producto, opcion, qty }] : [];
      }),
    );
    const porProducto = new Map<string, number>();
    for (const l of lineas) porProducto.set(l.producto.id, (porProducto.get(l.producto.id) ?? 0) + l.qty);
    return {
      ...state,
      lineas,
      count: lineas.reduce((a, l) => a + l.qty, 0),
      qtyProducto: (id) => porProducto.get(id) ?? 0,
      open,
      toast,
      bump,
      add,
      setQty,
      setField: (field, value) => dispatch({ type: "field", field, value }),
      setEntrega: (value) => dispatch({ type: "entrega", value }),
      setSent: (value) => dispatch({ type: "sent", value }),
      reset: () => dispatch({ type: "reset" }),
      openDrawer: () => setOpen(true),
      closeDrawer: () => setOpen(false),
      filtro,
      setFiltro,
    };
  }, [state, open, toast, bump, add, setQty, filtro]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder debe usarse dentro de <OrderProvider>");
  return ctx;
}
