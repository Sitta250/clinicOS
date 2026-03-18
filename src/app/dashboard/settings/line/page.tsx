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

export default function LineSettingsPage() {
  const { clinic } = useClinic();
  const updateLineConfig = useMutation(api.clinics.updateLineConfig);

  const [channelId, setChannelId] = useState(clinic.lineChannelId ?? "");
  const [channelSecret, setChannelSecret] = useState(
    clinic.lineChannelSecret ?? ""
  );
  const [accessToken, setAccessToken] = useState(
    clinic.lineChannelAccessToken ?? ""
  );
  const [loading, setLoading] = useState(false);

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhooks/line/${clinic._id}`
      : "";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateLineConfig({
        id: clinic._id,
        lineChannelId: channelId,
        lineChannelSecret: channelSecret,
        lineChannelAccessToken: accessToken,
      });
      toast.success("LINE configuration updated");
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
      <h1 className="text-2xl font-bold">LINE Integration</h1>

      <Card>
        <CardHeader>
          <CardTitle>Webhook URL</CardTitle>
          <CardDescription>
            Set this as the Webhook URL in your LINE Developers Console.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input value={webhookUrl} readOnly className="font-mono text-xs" />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(webhookUrl);
                toast.success("Copied to clipboard");
              }}
            >
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Channel Credentials</CardTitle>
          <CardDescription>
            From your LINE Developers Console &gt; Messaging API channel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="channelId">Channel ID</Label>
              <Input
                id="channelId"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                placeholder="1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channelSecret">Channel Secret</Label>
              <Input
                id="channelSecret"
                type="password"
                value={channelSecret}
                onChange={(e) => setChannelSecret(e.target.value)}
                placeholder="Enter channel secret"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessToken">Channel Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Enter long-lived channel access token"
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Credentials"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
