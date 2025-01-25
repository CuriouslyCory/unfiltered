import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LOWERCASE_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "but",
  "by",
  "for",
  "in",
  "nor",
  "of",
  "on",
  "or",
  "so",
  "the",
  "to",
  "up",
  "yet",
]);

export function toTitleCase(str: string): string {
  return str
    .split(" ")
    .map((word, index) => {
      // Always capitalize first and last word
      if (index === 0 || index === str.split(" ").length - 1) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }

      // Check if word should be lowercase
      if (LOWERCASE_WORDS.has(word.toLowerCase())) {
        return word.toLowerCase();
      }

      // Capitalize other words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
