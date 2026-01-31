import { createAnthropic } from "@ai-sdk/anthropic";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import { FileSystemTree } from "@webcontainer/api";
import { Doc, Id } from "../../convex/_generated/dataModel";

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

type FileDoc = Doc<"files">;

/**
 * Convert flat Convex files to nested FileSystemTree for WebContainer
 */
export const buildFileTree = (files: FileDoc[]): FileSystemTree => {
  const tree: FileSystemTree = {};
  const filesMap = new Map(files.map((f) => [f._id, f]));

  const getPath = (file: FileDoc): string[] => {
    const parts: string[] = [file.name];
    let parentId = file.parentId;

    while (parentId) {
      const parent = filesMap.get(parentId);
      if (!parent) break;
      parts.unshift(parent.name);
      parentId = parent.parentId;
    }

    return parts;
  };

  for (const file of files) {
    const pathParts = getPath(file);
    let current = tree;

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const isLast = i === pathParts.length - 1;

      if (isLast) {
        if (file.type === "folder") {
          current[part] = { directory: {} };
        } else if (!file.storageId && file.content !== undefined) {
          current[part] = { file: { contents: file.content } };
        }
      } else {
        if (!current[part]) {
          current[part] = { directory: {} };
        }
        const node = current[part];
        if ("directory" in node) {
          current = node.directory;
        }
      }
    }
  }

  return tree;
};

/**
 * Get full path for a file by traversing parent chain
 */
export const getFilePath = (
  file: FileDoc,
  filesMap: Map<Id<"files">, FileDoc>,
): string => {
  const parts: string[] = [file.name];
  let parentId = file.parentId;

  while (parentId) {
    const parent = filesMap.get(parentId);
    if (!parent) break;
    parts.unshift(parent.name);
    parentId = parent.parentId;
  }

  return parts.join("/");
};
