import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import verifyAuth from "./auth";
import { Doc, Id } from "./_generated/dataModel";

// Helper function to collect all descendant IDs (including the root)
function collectDescendantIds(
  allFiles: Doc<"files">[],
  rootId: Id<"files">
): Id<"files">[] {
  const childrenMap = new Map<Id<"files"> | undefined, Doc<"files">[]>();

  // Build map for O(1) lookup of children by parent ID
  for (const file of allFiles) {
    const parentId = file.parentId;
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, []);
    }
    childrenMap.get(parentId)!.push(file);
  }

  // Collect all descendant IDs using BFS
  const idsToDelete: Id<"files">[] = [];
  const queue: Id<"files">[] = [rootId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    idsToDelete.push(currentId);

    const children = childrenMap.get(currentId) || [];
    for (const child of children) {
      queue.push(child._id);
    }
  }

  return idsToDelete;
}

export const getFiles = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);
    const project = await ctx.db.get("projects", args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.ownerId !== identity.subject) {
      throw new Error("Unauthorized access");
    }

    return await ctx.db
      .query("files")
      .withIndex("byProject", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const getFile = query({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);
    const file = await ctx.db.get("files", args.fileId);
    if (!file) {
      throw new Error("File not found");
    }
    const project = await ctx.db.get("projects", file.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.ownerId !== identity.subject) {
      throw new Error("Unauthorized access");
    }

    return file;
  },
});

export const getFolderContents = query({
  args: {
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);
    const project = await ctx.db.get("projects", args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.ownerId !== identity.subject) {
      throw new Error("Unauthorized access");
    }

    const files = await ctx.db
      .query("files")
      .withIndex("byProjectParent", (q) =>
        q.eq("projectId", args.projectId).eq("parentId", args.parentId),
      )
      .collect();

    //sort folders first, then files, both alphabetically by name
    return files.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === "folder" ? -1 : 1;
    });
  },
});

export const getFilePath = query({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);
    const file = await ctx.db.get("files", args.fileId);
    if (!file) {
      throw new Error("File not found");
    }
    const project = await ctx.db.get("projects", file.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.ownerId !== identity.subject) {
      throw new Error("Unauthorized access");
    }

    // Fetch all files for the project in ONE query
    const allFiles = await ctx.db
      .query("files")
      .withIndex("byProject", (q) => q.eq("projectId", file.projectId))
      .collect();

    // Build a map for O(1) parent lookup
    const fileMap = new Map(allFiles.map(f => [f._id, f]));

    // Walk up the parent chain in memory
    const path: { _id: string; name: string }[] = [];
    let current: typeof file | undefined = file;

    while (current) {
      path.unshift({ _id: current._id, name: current.name });
      current = current.parentId ? fileMap.get(current.parentId) : undefined;
    }

    return path;
  },
});

export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const createFile = mutation({
  args: {
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    name: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);
    const project = await ctx.db.get("projects", args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.ownerId !== identity.subject) {
      throw new Error("Unauthorized access");
    }

    //check if file with same name exists in the same folder
    const files = await ctx.db
      .query("files")
      .withIndex("byProjectParent", (q) =>
        q.eq("projectId", args.projectId).eq("parentId", args.parentId),
      )
      .collect();

    const existingFile = files.find(
      (f) => f.name === args.name && f.type === "file",
    );
    if (existingFile) {
      throw new Error("File with the same name already exists");
    }

    const now = Date.now();
    await ctx.db.insert("files", {
      projectId: args.projectId,
      parentId: args.parentId,
      name: args.name,
      content: args.content,
      type: "file",
      updatedAt: now,
    });
    await ctx.db.patch("projects", args.projectId, {
      updatedAt: now,
    });
  },
});

export const createFolder = mutation({
  args: {
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);
    const project = await ctx.db.get("projects", args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.ownerId !== identity.subject) {
      throw new Error("Unauthorized access");
    }

    //check if folder with same name exists in the same parent folder
    const files = await ctx.db
      .query("files")
      .withIndex("byProjectParent", (q) =>
        q.eq("projectId", args.projectId).eq("parentId", args.parentId),
      )
      .collect();

    const existingFolder = files.find(
      (f) => f.name === args.name && f.type === "folder",
    );
    if (existingFolder) {
      throw new Error("Folder with the same name already exists");
    }
    const now = Date.now();
    await ctx.db.insert("files", {
      projectId: args.projectId,
      parentId: args.parentId,
      name: args.name,
      type: "folder",
      updatedAt: now,
    });
    return await ctx.db.patch("projects", args.projectId, {
      updatedAt: now,
    });
  },
});

export const renameFile = mutation({
  args: {
    fileId: v.id("files"),
    newName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);
    const file = await ctx.db.get("files", args.fileId);
    if (!file) {
      throw new Error("File not found");
    }
    const project = await ctx.db.get("projects", file.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.ownerId !== identity.subject) {
      throw new Error("Unauthorized access");
    }
    //check if file or folder with same name exists in the same parent folder
    const files = await ctx.db
      .query("files")
      .withIndex("byProjectParent", (q) =>
        q.eq("projectId", file.projectId).eq("parentId", file.parentId),
      )
      .collect();

    const existing = files.find(
      (f) =>
        f.name === args.newName &&
        f.type === file.type &&
        f._id !== args.fileId,
    );

    if (existing) {
      throw new Error(
        `A ${file.type} with the same name ${args.newName} already exists`,
      );
    }

    const now = Date.now();

    await ctx.db.patch("files", args.fileId, {
      name: args.newName,
      updatedAt: now,
    });
    await ctx.db.patch("projects", file.projectId, {
      updatedAt: now,
    });
  },
});

export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);
    const file = await ctx.db.get("files", args.fileId);
    if (!file) {
      throw new Error("File not found");
    }
    const project = await ctx.db.get("projects", file.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.ownerId !== identity.subject) {
      throw new Error("Unauthorized access");
    }

    // Fetch all files for the project in ONE query
    const allFiles = await ctx.db
      .query("files")
      .withIndex("byProject", (q) => q.eq("projectId", file.projectId))
      .collect();

    // Collect all IDs to delete in memory
    const idsToDelete = collectDescendantIds(allFiles, args.fileId);

    // Delete all files (storage first, then DB records)
    for (const id of idsToDelete) {
      const item = allFiles.find((f) => f._id === id);
      if (item?.storageId) {
        await ctx.storage.delete(item.storageId);
      }
      await ctx.db.delete("files", id);
    }

    await ctx.db.patch("projects", file.projectId, {
      updatedAt: Date.now(),
    });
  },
});

export const updateFileContent = mutation({
  args: {
    fileId: v.id("files"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);
    const file = await ctx.db.get("files", args.fileId);
    if (!file) {
      throw new Error("File not found");
    }
    const project = await ctx.db.get("projects", file.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.ownerId !== identity.subject) {
      throw new Error("Unauthorized access");
    }
    const now = Date.now();
    await ctx.db.patch("files", args.fileId, {
      content: args.content,
      updatedAt: now,
    });
    await ctx.db.patch("projects", file.projectId, {
      updatedAt: now,
    });
  },
});
