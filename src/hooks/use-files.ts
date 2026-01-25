import { useMutation } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";

// Sort: folders first, then files, alphabetically within each group
const sortFiles = <T extends { type: "file" | "folder"; name: string }>(
  files: T[],
): T[] => {
  return [...files].sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === "folder" ? -1 : 1;
  });
};

export const useCreateFile = () => {
  return useMutation(api.files.createFile).withOptimisticUpdate(
    (localStore, args) => {
      const existingFiles = localStore.getQuery(api.files.getFolderContents, {
        projectId: args.projectId,
        parentId: args.parentId,
      });

      if (existingFiles !== undefined) {
        // eslint-disable-next-line react-hooks/purity -- optimistic update callback runs on mutation, not render
        const now = Date.now();
        const newFile = {
          _id: crypto.randomUUID() as Id<"files">,
          _creationTime: now,
          projectId: args.projectId,
          parentId: args.parentId,
          name: args.name,
          content: args.content,
          type: "file" as const,
          updatedAt: now,
        };

        localStore.setQuery(
          api.files.getFolderContents,
          { projectId: args.projectId, parentId: args.parentId },
          sortFiles([...existingFiles, newFile]),
        );
      }
    },
  );
};

export const useCreateFolder = () => {
  return useMutation(api.files.createFolder).withOptimisticUpdate(
    (localStore, args) => {
      const existingFiles = localStore.getQuery(api.files.getFolderContents, {
        projectId: args.projectId,
        parentId: args.parentId,
      });

      if (existingFiles !== undefined) {
        // eslint-disable-next-line react-hooks/purity -- optimistic update callback runs on mutation, not render
        const now = Date.now();
        const newFolder = {
          _id: crypto.randomUUID() as Id<"files">,
          _creationTime: now,
          projectId: args.projectId,
          parentId: args.parentId,
          name: args.name,
          type: "folder" as const,
          updatedAt: now,
        };

        localStore.setQuery(
          api.files.getFolderContents,
          { projectId: args.projectId, parentId: args.parentId },
          sortFiles([...existingFiles, newFolder]),
        );
      }
    },
  );
};
