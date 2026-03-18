import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByClerkUserId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId)
      )
      .unique();
  },
});

export const listByClinic = query({
  args: { clinicId: v.id("clinics") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clinic", (q) => q.eq("clinicId", args.clinicId))
      .collect();
  },
});

export const create = mutation({
  args: {
    clinicId: v.id("clinics"),
    clerkUserId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("owner"), v.literal("staff")),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      ...args,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal("owner"), v.literal("staff"))),
    isActive: v.optional(v.boolean()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    await ctx.db.patch(id, updates);
  },
});

export const updateLastLogin = mutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId)
      )
      .unique();
    if (user) {
      await ctx.db.patch(user._id, { lastLoginAt: Date.now() });
    }
  },
});
