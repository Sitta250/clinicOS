"use client";

import { UserButton } from "@clerk/nextjs";
import { useClinic } from "@/components/clinic-provider";

export function Topbar() {
  const { currentUser } = useClinic();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {currentUser.name}
        </span>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
