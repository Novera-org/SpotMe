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
  return new Intl.DateTimeFormat(undefined, options).format(dateObj);
}

export function getUserDisplayLabel(
  name: string | null | undefined,
  email: string | null | undefined,
) {
  const trimmedName = name?.trim();
  if (trimmedName) {
    return trimmedName;
  }

  const trimmedEmail = email?.trim();
  if (!trimmedEmail) {
    return "Account";
  }

  return trimmedEmail.split("@")[0] || trimmedEmail;
}
