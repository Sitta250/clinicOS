"use client";

import { createContext, useContext, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface ClinicUser {
  _id: Id<"users">;
  clinicId: Id<"clinics">;
  clerkUserId: string;
  email: string;
  name: string;
  role: "owner" | "staff";
  avatarUrl?: string;
  isActive: boolean;
}

interface Clinic {
  _id: Id<"clinics">;
  name: string;
  slug: string;
  timezone: string;
  settings: Record<string, unknown>;
  plan: "free" | "starter" | "pro";
  lineChannelId?: string;
  lineChannelSecret?: string;
  lineChannelAccessToken?: string;
}

interface ClinicContextType {
  clinic: Clinic;
  currentUser: ClinicUser;
}

const ClinicContext = createContext<ClinicContextType | null>(null);

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) {
    throw new Error("useClinic must be used within ClinicProvider");
  }
  return ctx;
}

export function ClinicProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const router = useRouter();

  const dbUser = useQuery(
    api.users.getByClerkUserId,
    clerkUser?.id ? { clerkUserId: clerkUser.id } : "skip"
  );

  const clinic = useQuery(
    api.clinics.getById,
    dbUser?.clinicId ? { id: dbUser.clinicId } : "skip"
  );

  // Still loading
  if (!isClerkLoaded || dbUser === undefined || clinic === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  // No user record — redirect to onboarding
  if (!dbUser || !clinic) {
    router.push("/onboarding");
    return null;
  }

  return (
    <ClinicContext.Provider
      value={{
        clinic: clinic as Clinic,
        currentUser: dbUser as ClinicUser,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
}
