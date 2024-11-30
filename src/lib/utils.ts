import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export const ADMIN = true;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
