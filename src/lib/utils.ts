import { createAnthropic } from "@ai-sdk/anthropic";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function generateName() {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: "-",
    style: "lowerCase",
  });
}

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});
