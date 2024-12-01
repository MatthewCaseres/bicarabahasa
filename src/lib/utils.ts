import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export const roles = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
