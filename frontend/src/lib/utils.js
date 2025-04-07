import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges multiple class names and resolves Tailwind CSS conflicts
 * @param  {...any} inputs - Class names to merge
 * @returns {string} - Merged class name string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date into a readable string
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Creates a delay using a promise
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after the delay
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
} 