import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const leadStatusValidator = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("qualified"),
  v.literal("booked"),
  v.literal("completed"),
  v.literal("lost"),
  v.literal("cold")
);

export const list = query({
  args: {
    clinicId: v.id("clinics"),
    status: v.optional(leadStatusValidator),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("leads")
        .withIndex("by_clinic_status", (q) =>
          q.eq("clinicId", args.clinicId).eq("status", args.status!)
        )
        .collect();
    }
    return await ctx.db
      .query("leads")
      .withIndex("by_clinic_last_message", (q) =>
        q.eq("clinicId", args.clinicId)
      )
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByLineUserId = query({
  args: { clinicId: v.id("clinics"), lineUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_clinic_line_user", (q) =>
        q.eq("clinicId", args.clinicId).eq("lineUserId", args.lineUserId)
      )
      .unique();
  },
});

export const create = mutation({
  args: {
    clinicId: v.id("clinics"),
    lineUserId: v.optional(v.string()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    source: v.union(v.literal("line"), v.literal("web_form"), v.literal("manual")),
    treatmentInterest: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("leads", {
      ...args,
      status: "new",
      tags: [],
      firstContactAt: Date.now(),
      lastMessageAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("leads"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    treatmentInterest: v.optional(v.string()),
    urgency: v.optional(
      v.union(v.literal("hot"), v.literal("warm"), v.literal("cold"))
    ),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    assignedUserId: v.optional(v.id("users")),
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

export const updateStatus = mutation({
  args: {
    id: v.id("leads"),
    status: leadStatusValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
