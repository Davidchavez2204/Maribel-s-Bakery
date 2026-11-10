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
import { PRODUCTOS, PRODUCTOS_POR_ID, type Filtro } from "@/data/productos";
import type { Entrega, LineaPedido } from "@/lib/whatsapp";

const STORAGE_KEY = "maribels_pedido_v1";
const MAX_QTY = 99;

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
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    const { cart, nombre } = data as { cart?: unknown; nombre?: unknown };
    const clean: Record<string, number> = {};
    if (typeof cart === "object" && cart !== null) {
      for (const [id, q] of Object.entries(cart)) {
        if (PRODUCTOS_POR_ID.has(id) && Number.isInteger(q) && (q as number) > 0) {
          clean[id] = Math.min(q as number, MAX_QTY);
        }
      }
    }
    return { cart: clean, nombre: typeof nombre === "string" ? nombre.slice(0, 80) : "" };
  } catch {
    return null;
  }
}

interface OrderContextValue extends State {
  lineas: LineaPedido[];
  count: number;
  open: boolean;
  toast: string | null;
  bump: boolean;
  /** Agrega 1 unidad; muestra toast y bump solo si el producto era nuevo. */
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
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

  const add = useCallback((id: string) => {
    const current = state.cart[id] ?? 0;
    dispatch({ type: "setQty", id, qty: current + 1 });
    if (current === 0) {
      const p = PRODUCTOS_POR_ID.get(id);
      clearTimeout(toastTimer.current);
      clearTimeout(bumpTimer.current);
      setToast(`${p?.nombre ?? "Tu postre"} ya está en tu pedido`);
      setBump(true);
      bumpTimer.current = setTimeout(() => setBump(false), 220);
      toastTimer.current = setTimeout(() => setToast(null), 2200);
    }
  }, [state.cart]);

  const value = useMemo<OrderContextValue>(() => {
    // Respeta el orden de la carta, no el orden de inserción.
    const lineas = PRODUCTOS.filter((p) => state.cart[p.id]).map((p) => ({ producto: p, qty: state.cart[p.id] ?? 0 }));
    return {
      ...state,
      lineas,
      count: lineas.reduce((a, l) => a + l.qty, 0),
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
