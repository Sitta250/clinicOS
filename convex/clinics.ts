import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clinics")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getById = query({
  args: { id: v.id("clinics") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("clinics")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw new Error("Clinic slug already taken");
    }

    return await ctx.db.insert("clinics", {
      name: args.name,
      slug: args.slug,
      timezone: "Asia/Bangkok",
      settings: {
        defaultFollowUpDays: 1,
        defaultRebookingDays: 14,
        businessHours: { start: "09:00", end: "18:00" },
      },
      plan: "free",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("clinics"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    timezone: v.optional(v.string()),
    settings: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    if (args.slug) {
      const existing = await ctx.db
        .query("clinics")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug!))
        .unique();
      if (existing && existing._id !== id) {
        throw new Error("Clinic slug already taken");
      }
    }

    await ctx.db.patch(id, updates);
  },
});

export const updateLineConfig = mutation({
  args: {
    id: v.id("clinics"),
    lineChannelId: v.string(),
    lineChannelSecret: v.string(),
    lineChannelAccessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...lineConfig } = args;
    await ctx.db.patch(id, lineConfig);
  },
});
