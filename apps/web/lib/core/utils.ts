import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges multiple class names using clsx and tailwind-merge
 *
 * @function cn
 * @param {...ClassValue[]} inputs - Class names to merge (strings, objects, arrays)
 * @returns {string} Merged and deduplicated class string
 *
 * @example
 * cn("px-4 py-2", "bg-blue-500", { "opacity-50": isDisabled })
 * // Returns: "px-4 py-2 bg-blue-500 opacity-50" (if isDisabled is true)
 *
 * @example
 * cn("p-4", "p-2") // tailwind-merge handles conflicts
 * // Returns: "p-2" (last value wins for conflicting utilities)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
