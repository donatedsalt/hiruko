import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  value: number,
  currency: string = "USD",
  locale: string = "en-US",
) {
  return value.toLocaleString(locale, { style: "currency", currency });
}
