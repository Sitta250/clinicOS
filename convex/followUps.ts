import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listPending = query({
  args: { clinicId: v.id("clinics") },
  handler: async (ctx, args) => {
    const followUps = await ctx.db
      .query("followUps")
      .withIndex("by_clinic_pending", (q) =>
        q.eq("clinicId", args.clinicId).eq("status", "pending")
      )
      .collect();

    // Enrich with lead data
    const enriched = await Promise.all(
      followUps.map(async (fu) => {
        const lead = await ctx.db.get(fu.leadId);
        return { ...fu, lead };
      })
    );

    return enriched;
  },
});

export const listByLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("followUps")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .collect();
  },
});

export const complete = mutation({
  args: {
    id: v.id("followUps"),
    completedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "completed",
      completedAt: Date.now(),
      completedBy: args.completedBy,
    });
  },
});

export const skip = mutation({
  args: {
    id: v.id("followUps"),
    skipReason: v.string(),
    completedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "skipped",
      skipReason: args.skipReason,
      completedAt: Date.now(),
      completedBy: args.completedBy,
    });
  },
});

export const create = mutation({
  args: {
    clinicId: v.id("clinics"),
    leadId: v.id("leads"),
    bookingId: v.optional(v.id("bookings")),
    type: v.union(
      v.literal("no_response"),
      v.literal("rebooking"),
      v.literal("custom")
    ),
    triggerDate: v.number(),
    messageDraft: v.optional(v.string()),
    attemptNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("followUps", {
      ...args,
      status: "pending",
      attemptNumber: args.attemptNumber ?? 1,
    });
  },
});
