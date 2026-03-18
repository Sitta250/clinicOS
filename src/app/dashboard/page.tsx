"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useClinic } from "@/components/clinic-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Users, Calendar, ListTodo } from "lucide-react";
import Link from "next/link";

const statCards = [
  {
    label: "New Leads Today",
    key: "newLeadsToday" as const,
    icon: Users,
    href: "/dashboard/leads",
    color: "text-blue-600",
  },
  {
    label: "Unread Messages",
    key: "unreadCount" as const,
    icon: MessageSquare,
    href: "/dashboard/inbox",
    color: "text-orange-600",
  },
  {
    label: "Today's Bookings",
    key: "todayBookings" as const,
    icon: Calendar,
    href: "/dashboard/bookings",
    color: "text-green-600",
  },
  {
    label: "Pending Tasks",
    key: "pendingTasks" as const,
    icon: ListTodo,
    href: "/dashboard/tasks",
    color: "text-purple-600",
  },
];

export default function DashboardPage() {
  const { clinic } = useClinic();
  const stats = useQuery(api.dashboard.getStats, { clinicId: clinic._id });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link key={card.key} href={card.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                {stats === undefined ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{stats[card.key]}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Today's bookings */}
      <TodayBookings />
    </div>
  );
}

function TodayBookings() {
  const { clinic } = useClinic();
  const bookings = useQuery(api.bookings.getToday, { clinicId: clinic._id });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Today&apos;s Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {bookings === undefined ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No bookings scheduled for today.
          </p>
        ) : (
          <div className="space-y-2">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {booking.lead?.name ?? "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {booking.treatment?.name ?? "General consultation"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {new Date(booking.scheduledAt).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {booking.durationMinutes} min
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
