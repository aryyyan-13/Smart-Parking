/* ponytail: simple Zustand store — no complex middleware needed */
import { create } from "zustand";

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AED";

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  /** Exchange rate from INR */
  rateFromINR: number;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee",   rateFromINR: 1 },
  USD: { code: "USD", symbol: "$", name: "US Dollar",       rateFromINR: 0.012 },
  EUR: { code: "EUR", symbol: "€", name: "Euro",            rateFromINR: 0.011 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound",   rateFromINR: 0.0095 },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham",   rateFromINR: 0.044 },
};

interface CurrencyState {
  active: CurrencyCode;
  setActive: (code: CurrencyCode) => void;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  active: "INR",
  setActive: (code) => set({ active: code }),
}));

/** Format an INR amount in the currently-selected currency */
export function formatPrice(amountInINR: number, currencyCode: CurrencyCode): string {
  const c = CURRENCIES[currencyCode];
  const converted = amountInINR * c.rateFromINR;
  // Show 2 decimal places for non-INR, integers for INR
  const formatted =
    currencyCode === "INR"
      ? Math.round(converted).toLocaleString("en-IN")
      : converted < 1
      ? converted.toFixed(3)
      : converted.toFixed(2);
  return `${c.symbol}${formatted}`;
}
