import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sendAnalytics(action: string, parameters: Record<string, string | number | boolean | null> = {}) {
    console.log(`[Analytics]`, action, parameters);
}