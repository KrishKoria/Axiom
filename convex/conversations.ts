import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import verifyAuth from "./auth";

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
  },
  handler: async (ctx, { projectId, title }) => {
    const identity = await verifyAuth(ctx);
    const projects = await ctx.db.get(projectId);
    if (!projects) {
      throw new Error("Project not found");
    }
    if (projects.ownerId !== identity.subject) {
      throw new Error("Unauthorized");
    }
    const conversationId = await ctx.db.insert("conversations", {
      projectId,
      title,
      updatedAt: Date.now(),
    });
    return conversationId;
  },
});

export const getById = query({
  args: {
    id: v.id("conversations"),
  },
  handler: async (ctx, { id }) => {
    const identity = await verifyAuth(ctx);

    const conversation = await ctx.db.get("conversations", id);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const project = await ctx.db.get("projects", conversation.projectId);

    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== identity.subject) {
      throw new Error("Unauthorized to access this project");
    }

    return conversation;
  },
});

export const getByProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const identity = await verifyAuth(ctx);

    const project = await ctx.db.get("projects", projectId);

    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== identity.subject) {
      throw new Error("Unauthorized to access this project");
    }

    return await ctx.db
      .query("conversations")
      .withIndex("byProject", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, { conversationId }) => {
    const identity = await verifyAuth(ctx);

    const conversation = await ctx.db.get("conversations", conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const project = await ctx.db.get("projects", conversation.projectId);

    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== identity.subject) {
      throw new Error("Unauthorized to access this project");
    }

    return await ctx.db
      .query("messages")
      .withIndex("byConversation", (q) =>
        q.eq("conversationId", conversationId),
      )
      .order("asc")
      .collect();
  },
});
