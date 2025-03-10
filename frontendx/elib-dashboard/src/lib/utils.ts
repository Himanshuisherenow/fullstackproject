import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function ProperDate(dateString: string): string {
	const date: Date = new Date(dateString);

	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		timeZone: 'UTC',
	};

	return date.toLocaleString('en-US', options);
}