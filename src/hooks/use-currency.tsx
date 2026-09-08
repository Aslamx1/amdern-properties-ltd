import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { CURRENCIES } from "@/lib/site";

type Currency = {
  code: string;
  label: string;
  symbol: string;
  rateToUGX: number;
};

type CurrencyContextValue = {
  currency: Currency;
  setCurrencyCode: (code: string) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

function getDefaultCurrency(): Currency {
  try {
    const saved = typeof window !== "undefined" ? localStorage.getItem("amdern_currency") : null;
    if (saved) {
      const found = CURRENCIES.find((c) => c.code === saved);
      if (found) return found;
    }
  } catch {
    // ignore
  }
  return CURRENCIES[0];
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(getDefaultCurrency);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<string>;
      const code = custom.detail;
      const found = CURRENCIES.find((c) => c.code === code);
      if (found) setCurrency(found);
    };
    window.addEventListener("currency-change", handler);
    return () => window.removeEventListener("currency-change", handler);
  }, []);

  const setCurrencyCode = (code: string) => {
    const found = CURRENCIES.find((c) => c.code === code);
    if (!found) return;
    setCurrency(found);
    try {
      localStorage.setItem("amdern_currency", code);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent("currency-change", { detail: code }));
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrencyCode }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

export function convertToCurrency(valueUGX: number, targetCode: string): number {
  if (targetCode === "UGX") return Math.round(valueUGX);
  const target = CURRENCIES.find((c) => c.code === targetCode);
  if (!target) return Math.round(valueUGX);
  return Math.round(valueUGX / target.rateToUGX);
}

export function formatWithCurrency(valueUGX: number, targetCode: string): string {
  const converted = convertToCurrency(valueUGX, targetCode);
  const currency = CURRENCIES.find((c) => c.code === targetCode) || CURRENCIES[0];
  if (targetCode === "UGX") {
    return `USh ${converted.toLocaleString("en-US")}`;
  }
  if (targetCode === "USD") {
    return `$${converted.toLocaleString("en-US")}`;
  }
  if (targetCode === "GBP") {
    return `£${converted.toLocaleString("en-US")}`;
  }
  if (targetCode === "EUR") {
    return `€${converted.toLocaleString("en-US")}`;
  }
  if (targetCode === "KES") {
    return `KSh ${converted.toLocaleString("en-US")}`;
  }
  if (targetCode === "CAD") {
    return `C$${converted.toLocaleString("en-US")}`;
  }
  return `${currency.symbol} ${converted.toLocaleString("en-US")}`;
}
