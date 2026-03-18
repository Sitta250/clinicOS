import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    clinicId: v.id("clinics"),
    conversationId: v.id("conversations"),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    senderType: v.union(
      v.literal("patient"),
      v.literal("staff"),
      v.literal("system")
    ),
    senderId: v.optional(v.id("users")),
    content: v.optional(v.string()),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("sticker"),
      v.literal("template"),
      v.literal("system")
    ),
    lineMessageId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      ...args,
    });

    // Update conversation last message time
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    });

    // Update lead last message time
    const conversation = await ctx.db.get(args.conversationId);
    if (conversation) {
      await ctx.db.patch(conversation.leadId, {
        lastMessageAt: Date.now(),
      });
    }

    return messageId;
  },
});

export const updateAiClassification = mutation({
  args: {
    id: v.id("messages"),
    aiClassification: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      aiClassification: args.aiClassification,
    });
  },
});
