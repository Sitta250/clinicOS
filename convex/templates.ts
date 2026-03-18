import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { clinicId: v.id("clinics") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("templates")
      .withIndex("by_clinic", (q) => q.eq("clinicId", args.clinicId))
      .collect();
  },
});

export const getByCategory = query({
  args: {
    clinicId: v.id("clinics"),
    category: v.union(
      v.literal("greeting"),
      v.literal("follow_up"),
      v.literal("booking_confirm"),
      v.literal("rebooking"),
      v.literal("treatment_info"),
      v.literal("custom")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("templates")
      .withIndex("by_clinic_category", (q) =>
        q.eq("clinicId", args.clinicId).eq("category", args.category)
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    clinicId: v.id("clinics"),
    name: v.string(),
    category: v.union(
      v.literal("greeting"),
      v.literal("follow_up"),
      v.literal("booking_confirm"),
      v.literal("rebooking"),
      v.literal("treatment_info"),
      v.literal("custom")
    ),
    content: v.string(),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("templates", {
      ...args,
      language: args.language ?? "th",
      isActive: true,
      usageCount: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("templates"),
    name: v.optional(v.string()),
    content: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
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

export const incrementUsage = mutation({
  args: { id: v.id("templates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id);
    if (template) {
      await ctx.db.patch(args.id, {
        usageCount: template.usageCount + 1,
      });
    }
  },
});

export const seedDefaults = mutation({
  args: { clinicId: v.id("clinics") },
  handler: async (ctx, args) => {
    const defaults = [
      {
        name: "Welcome Greeting",
        category: "greeting" as const,
        content:
          "สวัสดีค่ะ ขอบคุณที่สนใจ {{clinic_name}} ค่ะ 😊 สนใจทำหัตถการอะไรคะ?",
        language: "th",
      },
      {
        name: "Booking Confirmation",
        category: "booking_confirm" as const,
        content:
          "ยืนยันการนัดหมาย {{treatment}} วันที่ {{booking_date}} เวลา {{booking_time}} ค่ะ แล้วพบกันนะคะ 🙏",
        language: "th",
      },
      {
        name: "Follow-up (24h)",
        category: "follow_up" as const,
        content:
          "สวัสดีค่ะ {{name}} ไม่ทราบว่ายังสนใจ {{treatment}} อยู่ไหมคะ? ยินดีให้ข้อมูลเพิ่มเติมค่ะ",
        language: "th",
      },
      {
        name: "Follow-up (72h)",
        category: "follow_up" as const,
        content:
          "สวัสดีค่ะ {{name}} 🙏 เราอยากเรียนเชิญมาปรึกษาเกี่ยวกับ {{treatment}} ค่ะ ตอนนี้มีโปรโมชั่นพิเศษด้วยนะคะ",
        language: "th",
      },
      {
        name: "Rebooking Reminder",
        category: "rebooking" as const,
        content:
          "สวัสดีค่ะ {{name}} 😊 ครบกำหนดนัดทำ {{treatment}} ครั้งถัดไปแล้วค่ะ อยากจองคิวเลยไหมคะ?",
        language: "th",
      },
    ];

    for (const template of defaults) {
      await ctx.db.insert("templates", {
        clinicId: args.clinicId,
        ...template,
        isActive: true,
        usageCount: 0,
      });
    }
  },
});
