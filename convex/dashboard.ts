import { v } from "convex/values";
import { query } from "./_generated/server";

export const getStats = query({
  args: { clinicId: v.id("clinics") },
  handler: async (ctx, args) => {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    // New leads today
    const allLeads = await ctx.db
      .query("leads")
      .withIndex("by_clinic_status", (q) =>
        q.eq("clinicId", args.clinicId).eq("status", "new")
      )
      .collect();
    const newLeadsToday = allLeads.filter(
      (l) => l.firstContactAt >= startOfDay
    ).length;

    // Unread conversations
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_clinic", (q) => q.eq("clinicId", args.clinicId))
      .collect();
    const unreadCount = conversations.filter((c) => c.unreadCount > 0).length;

    // Today's bookings
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
    const todayBookings = await ctx.db
      .query("bookings")
      .withIndex("by_clinic_date", (q) =>
        q
          .eq("clinicId", args.clinicId)
          .gte("scheduledAt", startOfDay)
          .lt("scheduledAt", endOfDay)
      )
      .collect();

    // Pending follow-ups
    const pendingFollowUps = await ctx.db
      .query("followUps")
      .withIndex("by_clinic_pending", (q) =>
        q.eq("clinicId", args.clinicId).eq("status", "pending")
      )
      .collect();
    const dueFollowUps = pendingFollowUps.filter(
      (f) => f.triggerDate <= Date.now()
    ).length;

    return {
      newLeadsToday,
      unreadCount,
      todayBookings: todayBookings.length,
      pendingTasks: dueFollowUps,
    };
  },
});
