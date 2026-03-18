import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  clinics: defineTable({
    name: v.string(),
    slug: v.string(),
    lineChannelId: v.optional(v.string()),
    lineChannelSecret: v.optional(v.string()),
    lineChannelAccessToken: v.optional(v.string()),
    timezone: v.string(),
    settings: v.any(), // { businessHours, defaultFollowUpDays, tone }
    plan: v.union(v.literal("free"), v.literal("starter"), v.literal("pro")),
  })
    .index("by_slug", ["slug"]),

  users: defineTable({
    clinicId: v.id("clinics"),
    clerkUserId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("owner"), v.literal("staff")),
    avatarUrl: v.optional(v.string()),
    isActive: v.boolean(),
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_clinic", ["clinicId"])
    .index("by_clerk_user_id", ["clerkUserId"]),

  leads: defineTable({
    clinicId: v.id("clinics"),
    lineUserId: v.optional(v.string()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    source: v.union(
      v.literal("line"),
      v.literal("web_form"),
      v.literal("manual")
    ),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("booked"),
      v.literal("completed"),
      v.literal("lost"),
      v.literal("cold")
    ),
    treatmentInterest: v.optional(v.string()),
    urgency: v.optional(
      v.union(v.literal("hot"), v.literal("warm"), v.literal("cold"))
    ),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    assignedUserId: v.optional(v.id("users")),
    firstContactAt: v.number(),
    lastMessageAt: v.optional(v.number()),
  })
    .index("by_clinic_status", ["clinicId", "status"])
    .index("by_clinic_line_user", ["clinicId", "lineUserId"])
    .index("by_clinic_last_message", ["clinicId", "lastMessageAt"]),

  conversations: defineTable({
    clinicId: v.id("clinics"),
    leadId: v.id("leads"),
    source: v.union(
      v.literal("line"),
      v.literal("web_form"),
      v.literal("manual")
    ),
    status: v.union(v.literal("open"), v.literal("closed")),
    unreadCount: v.number(),
    lastMessageAt: v.optional(v.number()),
    summary: v.optional(v.string()),
  })
    .index("by_clinic", ["clinicId"])
    .index("by_clinic_last_message", ["clinicId", "lastMessageAt"])
    .index("by_lead", ["leadId"]),

  messages: defineTable({
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
    aiClassification: v.optional(v.any()),
    metadata: v.optional(v.any()),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_clinic", ["clinicId"]),

  bookings: defineTable({
    clinicId: v.id("clinics"),
    leadId: v.id("leads"),
    treatmentId: v.optional(v.id("treatments")),
    status: v.union(
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show")
    ),
    scheduledAt: v.number(),
    durationMinutes: v.number(),
    notes: v.optional(v.string()),
    assignedUserId: v.optional(v.id("users")),
    reminderSentAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    rebookingIntervalDays: v.optional(v.number()),
  })
    .index("by_clinic_date", ["clinicId", "scheduledAt"])
    .index("by_lead", ["leadId"]),

  treatments: defineTable({
    clinicId: v.id("clinics"),
    name: v.string(),
    description: v.optional(v.string()),
    defaultDurationMinutes: v.number(),
    defaultRebookingDays: v.optional(v.number()),
    isActive: v.boolean(),
    sortOrder: v.number(),
  }).index("by_clinic", ["clinicId"]),

  followUps: defineTable({
    clinicId: v.id("clinics"),
    leadId: v.id("leads"),
    bookingId: v.optional(v.id("bookings")),
    type: v.union(
      v.literal("no_response"),
      v.literal("rebooking"),
      v.literal("custom")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("skipped")
    ),
    triggerDate: v.number(),
    messageDraft: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    completedBy: v.optional(v.id("users")),
    skipReason: v.optional(v.string()),
    attemptNumber: v.number(),
  })
    .index("by_clinic_pending", ["clinicId", "status", "triggerDate"])
    .index("by_lead", ["leadId"]),

  templates: defineTable({
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
    language: v.string(),
    isActive: v.boolean(),
    usageCount: v.number(),
  })
    .index("by_clinic", ["clinicId"])
    .index("by_clinic_category", ["clinicId", "category"]),

  aiLogs: defineTable({
    clinicId: v.id("clinics"),
    taskType: v.union(
      v.literal("classify"),
      v.literal("extract"),
      v.literal("draft_reply"),
      v.literal("summarize")
    ),
    inputText: v.optional(v.string()),
    output: v.optional(v.any()),
    model: v.string(),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
    latencyMs: v.optional(v.number()),
    confidence: v.optional(v.number()),
    humanOverride: v.boolean(),
    referenceType: v.optional(v.string()),
    referenceId: v.optional(v.string()),
  }).index("by_clinic", ["clinicId"]),
});
