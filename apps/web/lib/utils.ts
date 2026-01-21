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
// -----------------------------------------------------------------------------
// Event Listener Helpers (Limeplay)
// -----------------------------------------------------------------------------

/**
 * Adds an event listener to a target element
 */
export function on<T extends Window | Document | HTMLElement | EventTarget>(
  obj: T | null,
  eventName: string,
  handler: EventListenerOrEventListenerObject | null,
  options?: boolean | AddEventListenerOptions,
): void {
  if (obj?.addEventListener && handler) {
    obj.addEventListener(eventName, handler, options);
  }
}

/**
 * Removes an event listener from a target element
 */
export function off<T extends Window | Document | HTMLElement | EventTarget>(
  obj: T | null,
  eventName: string,
  handler: EventListenerOrEventListenerObject | null,
  options?: boolean | EventListenerOptions,
): void {
  if (obj?.removeEventListener && handler) {
    obj.removeEventListener(eventName, handler, options);
  }
}

// -----------------------------------------------------------------------------
// General Utilities
// -----------------------------------------------------------------------------

/**
 * No-operation function - does nothing, useful as default callback
 */
export function noop(): void {}

/**
 * Rounds a number to specified decimal places
 */
export function toFixedNumber(num: number, digits: number = 2): number {
  const pow = 10 ** digits;
  return Math.round(num * pow) / pow;
}

/**
 * Gets the device/browser language
 */
export function getDeviceLanguage(): string {
  if (typeof navigator !== 'undefined') {
    return (
      navigator.language || (navigator as unknown as { userLanguage?: string }).userLanguage || 'en'
    );
  }
  return 'en';
}
