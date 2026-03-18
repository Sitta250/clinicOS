import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { clinicId: v.id("clinics") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("treatments")
      .withIndex("by_clinic", (q) => q.eq("clinicId", args.clinicId))
      .collect();
  },
});

export const create = mutation({
  args: {
    clinicId: v.id("clinics"),
    name: v.string(),
    description: v.optional(v.string()),
    defaultDurationMinutes: v.number(),
    defaultRebookingDays: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("treatments", {
      ...args,
      isActive: true,
      sortOrder: args.sortOrder ?? 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("treatments"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    defaultDurationMinutes: v.optional(v.number()),
    defaultRebookingDays: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
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
