import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeText(value: string): string {
  return value
    .trim()
    .replace(/\.+$/, "")                    // strip trailing periods
    .replace(/,(?=[^\s])/g, ", ")           // fix missing space after commas
    .trim();
}

export function parseRank(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = parseFloat(String(value));
  return isNaN(num) ? null : Math.round(num);
}
