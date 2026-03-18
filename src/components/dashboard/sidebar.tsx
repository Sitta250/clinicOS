"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useClinic } from "@/components/clinic-provider";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Calendar,
  ListTodo,
  FileText,
  Settings,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Inbox",
    href: "/dashboard/inbox",
    icon: MessageSquare,
  },
  {
    label: "Leads",
    href: "/dashboard/leads",
    icon: Users,
  },
  {
    label: "Bookings",
    href: "/dashboard/bookings",
    icon: Calendar,
  },
  {
    label: "Tasks",
    href: "/dashboard/tasks",
    icon: ListTodo,
  },
  {
    label: "Templates",
    href: "/dashboard/templates",
    icon: FileText,
  },
  {
    label: "Settings",
    href: "/dashboard/settings/clinic",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { clinic } = useClinic();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-white">
      {/* Logo / Clinic name */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            C
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">
              ClinicOS
            </span>
            <span className="text-xs text-muted-foreground leading-tight truncate max-w-[160px]">
              {clinic.name}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Plan badge */}
      <div className="border-t p-3">
        <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          Plan: <span className="font-medium capitalize">{clinic.plan}</span>
        </div>
      </div>
    </aside>
  );
}
