import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { clinicId: v.id("clinics") },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_clinic_last_message", (q) =>
        q.eq("clinicId", args.clinicId)
      )
      .order("desc")
      .collect();

    // Enrich with lead data
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const lead = await ctx.db.get(conv.leadId);
        return { ...conv, lead };
      })
    );

    return enriched;
  },
});

export const getByLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .order("desc")
      .first();
  },
});

export const getWithMessages = query({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.id);
    if (!conversation) return null;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.id)
      )
      .collect();

    const lead = await ctx.db.get(conversation.leadId);

    return { ...conversation, messages, lead };
  },
});

export const create = mutation({
  args: {
    clinicId: v.id("clinics"),
    leadId: v.id("leads"),
    source: v.union(v.literal("line"), v.literal("web_form"), v.literal("manual")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      ...args,
      status: "open",
      unreadCount: 0,
      lastMessageAt: Date.now(),
    });
  },
});

export const markRead = mutation({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { unreadCount: 0 });
  },
});

export const close = mutation({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "closed" });
  },
});

export const incrementUnread = mutation({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.id);
    if (conv) {
      await ctx.db.patch(args.id, {
        unreadCount: conv.unreadCount + 1,
        lastMessageAt: Date.now(),
      });
    }
  },
});
