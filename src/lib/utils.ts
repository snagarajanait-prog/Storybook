import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as USD currency. */
export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

/**
 * Split a "done" line into its body and any trailing reference id
 * (e.g. "…reference SR-4471-190." -> { body, ref: "SR-4471-190" }). Shared by
 * every chatbot variant so the parsing rule lives in exactly one place.
 */
export function splitReference(text: string): { body: string; ref: string | null } {
  const m = text.match(/\b([A-Z]{2,}-[A-Z0-9-]+)\b\.?$/)
  if (!m) return { body: text, ref: null }
  return {
    body: text.slice(0, m.index).replace(/(reference\s*)$/i, "").trim(),
    ref: m[1],
  }
}
