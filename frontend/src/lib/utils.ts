import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const MALIGNANCY_THRESHOLD = 0.5

export function isMalignant(malignancyProbability?: number) {
  return (malignancyProbability ?? 0) >= MALIGNANCY_THRESHOLD
}
