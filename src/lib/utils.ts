import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number, options: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
}) {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}
