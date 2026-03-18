"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useClinic } from "@/components/clinic-provider";
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
import { toast } from "sonner";

export default function ClinicSettingsPage() {
  const { clinic } = useClinic();
  const updateClinic = useMutation(api.clinics.update);

  const [name, setName] = useState(clinic.name);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateClinic({ id: clinic._id, name });
      toast.success("Clinic settings updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Clinic Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Basic information about your clinic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Clinic Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={clinic.slug} disabled />
              <p className="text-xs text-muted-foreground">
                Used in your booking link: clinicos.co/form/{clinic.slug}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input value={clinic.timezone} disabled />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
