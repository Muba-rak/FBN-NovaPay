import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes safely with clsx and twMerge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes merchant descriptions, recipient names, and untrusted inputs
 * against XSS injection, unprintable control characters, and malicious payloads.
 */
export function sanitizeText(text?: string | null): string {
  if (!text) return '';
  return String(text)
    // Strip HTML and XML tags (<script>, <b>, <img>, etc.)
    .replace(/<[^>]*>?/gm, '')
    // Strip dangerous non-printable and ASCII control characters (keep standard whitespace)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .trim();
}

/**
 * Sanitizes merchant payment narrations to conform with NIBSS NIP banking standards:
 * - Strips HTML tags and unprintable control characters
 * - Neutralizes formula injection characters (=, +, -, @)
 * - Limits length to 50 characters (NIBSS standard)
 */
export function sanitizeNarration(text?: string | null): string {
  if (!text) return '';
  return sanitizeText(text)
    // Neutralize formula injection triggers for exports and downstream logs
    .replace(/^[=+\-@\t\r]+/, '')
    .slice(0, 50);
}

/**
 * Formats ISO date string into human-readable format.
 * Example: "2026-09-16T08:30:00Z" -> "16 Sep 2026, 08:30 AM"
 */
export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Formats relative date or standard date.
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return isoString;
  }
}
