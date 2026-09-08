import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type Listing, LISTINGS } from "@/lib/listings";

const MAX_COMPARE = 4;
const STORAGE_KEY = "amdern_compare";

type CompareContextValue = {
  items: Listing[];
  add: (item: Listing) => void;
  remove: (id: string) => void;
  clear: () => void;
  isComparing: boolean;
};

const CompareContext = createContext<CompareContextValue | undefined>(undefined);

function loadCompare(): Listing[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return [];
    const ids: string[] = JSON.parse(raw);
    return ids.map((id) => LISTINGS.find((l) => l.id === id)).filter(Boolean) as Listing[];
  } catch {
    return [];
  }
}

function saveCompare(items: Listing[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map((i) => i.id)));
  } catch {
    // ignore
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Listing[]>(loadCompare);

  useEffect(() => {
    saveCompare(items);
  }, [items]);

  const add = useCallback((item: Listing) => {
    setItems((prev) => {
      if (prev.find((p) => p.id === item.id)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, item];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return (
    <CompareContext.Provider value={{ items, add, remove, clear, isComparing: items.length > 1 }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
