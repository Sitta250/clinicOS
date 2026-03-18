"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const createClinic = useMutation(api.clinics.create);
  const createUser = useMutation(api.users.create);
  const seedTemplates = useMutation(api.templates.seedDefaults);

  const [clinicName, setClinicName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !clinicName.trim()) return;

    setLoading(true);
    setError("");

    try {
      const slug = generateSlug(clinicName);
      const clinicId = await createClinic({ name: clinicName, slug });

      await createUser({
        clinicId,
        clerkUserId: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? "",
        name: user.fullName ?? user.firstName ?? "Owner",
        role: "owner",
        avatarUrl: user.imageUrl,
      });

      await seedTemplates({ clinicId });

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to ClinicOS</CardTitle>
          <CardDescription>
            Set up your clinic to get started. You can change these settings
            later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clinicName">Clinic Name</Label>
              <Input
                id="clinicName"
                placeholder="e.g. Glow Aesthetic Clinic"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                required
              />
              {clinicName && (
                <p className="text-sm text-muted-foreground">
                  Your booking link: clinicos.co/form/
                  {generateSlug(clinicName)}
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Clinic"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
