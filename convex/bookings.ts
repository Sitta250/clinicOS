import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    clinicId: v.id("clinics"),
    status: v.optional(
      v.union(
        v.literal("confirmed"),
        v.literal("completed"),
        v.literal("cancelled"),
        v.literal("no_show")
      )
    ),
  },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_clinic_date", (q) => q.eq("clinicId", args.clinicId))
      .order("desc")
      .collect();

    if (args.status) {
      return bookings.filter((b) => b.status === args.status);
    }

    // Enrich with lead data
    const enriched = await Promise.all(
      bookings.map(async (booking) => {
        const lead = await ctx.db.get(booking.leadId);
        const treatment = booking.treatmentId
          ? await ctx.db.get(booking.treatmentId)
          : null;
        return { ...booking, lead, treatment };
      })
    );

    return enriched;
  },
});

export const getToday = query({
  args: { clinicId: v.id("clinics") },
  handler: async (ctx, args) => {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_clinic_date", (q) =>
        q
          .eq("clinicId", args.clinicId)
          .gte("scheduledAt", startOfDay)
          .lt("scheduledAt", endOfDay)
      )
      .collect();

    const enriched = await Promise.all(
      bookings.map(async (booking) => {
        const lead = await ctx.db.get(booking.leadId);
        const treatment = booking.treatmentId
          ? await ctx.db.get(booking.treatmentId)
          : null;
        return { ...booking, lead, treatment };
      })
    );

    return enriched;
  },
});

export const create = mutation({
  args: {
    clinicId: v.id("clinics"),
    leadId: v.id("leads"),
    treatmentId: v.optional(v.id("treatments")),
    scheduledAt: v.number(),
    durationMinutes: v.number(),
    notes: v.optional(v.string()),
    assignedUserId: v.optional(v.id("users")),
    rebookingIntervalDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const bookingId = await ctx.db.insert("bookings", {
      ...args,
      status: "confirmed",
    });

    // Auto-update lead status to booked
    await ctx.db.patch(args.leadId, { status: "booked" });

    return bookingId;
  },
});

export const update = mutation({
  args: {
    id: v.id("bookings"),
    status: v.optional(
      v.union(
        v.literal("confirmed"),
        v.literal("completed"),
        v.literal("cancelled"),
        v.literal("no_show")
      )
    ),
    scheduledAt: v.optional(v.number()),
    notes: v.optional(v.string()),
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

export const complete = mutation({
  args: {
    id: v.id("bookings"),
    rebookingIntervalDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.id);
    if (!booking) throw new Error("Booking not found");

    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: "completed",
      completedAt: now,
      rebookingIntervalDays: args.rebookingIntervalDays,
    });

    // Auto-update lead status to completed
    await ctx.db.patch(booking.leadId, { status: "completed" });

    // Create rebooking follow-up if interval specified
    const interval = args.rebookingIntervalDays ?? booking.rebookingIntervalDays;
    if (interval) {
      await ctx.db.insert("followUps", {
        clinicId: booking.clinicId,
        leadId: booking.leadId,
        bookingId: args.id,
        type: "rebooking",
        status: "pending",
        triggerDate: now + interval * 24 * 60 * 60 * 1000,
        attemptNumber: 1,
      });
    }
  },
});
