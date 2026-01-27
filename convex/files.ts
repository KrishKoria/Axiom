import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import verifyAuth from "./auth";
import { Doc, Id } from "./_generated/dataModel";

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
    const path: { _id: string; name: string }[] = [];
    let currentId: Id<"files"> | undefined = args.fileId;
    while (currentId) {
      const currentFile = (await ctx.db.get("files", currentId)) as
        | Doc<"files">
        | undefined;
      if (!currentFile) break;
      path.unshift({ _id: currentFile._id, name: currentFile.name });
      currentId = currentFile.parentId;
    }
    return path;
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

    // recursively delete all child files/folders if folder
    async function deleteRecursively(fileId: Id<"files">) {
      const item = await ctx.db.get("files", fileId);
      if (!item) return;
      if (item.type === "folder") {
        const children = await ctx.db
          .query("files")
          .withIndex("byProjectParent", (q) =>
            q.eq("projectId", item.projectId).eq("parentId", fileId),
          )
          .collect();
        for (const child of children) {
          await deleteRecursively(child._id);
        }
      }
      if (item.storageId) {
        await ctx.storage.delete(item.storageId);
      }
      await ctx.db.delete("files", fileId);
    }

    await deleteRecursively(args.fileId);
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
