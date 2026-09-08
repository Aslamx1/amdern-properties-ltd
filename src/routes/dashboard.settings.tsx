import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { loadProfileForUser } from "@/lib/user-profile";
import { Building2, Bell, Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  component: DashboardSettings,
});

function DashboardSettings() {
  const [profile, setProfile] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    about: "",
  });
  const [notifications, setNotifications] = useState({
    email: true,
    whatsapp: true,
    calls: false,
    newLeads: true,
    weeklyReport: true,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        if (!user) {
          setLoading(false);
          return;
        }

        const profileState = await loadProfileForUser(user);
        setProfile({
          companyName: "",
          contactName: profileState?.full_name || "",
          email: user.email || "",
          phone: profileState?.phone || "",
          website: "",
          address: "",
          about: "",
        });

        const savedNotifications = localStorage.getItem("amdern_notifications");
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
        setError("Unable to load your saved profile settings right now.");
      } finally {
        setLoading(false);
      }
    };

    void hydrate();
  }, []);

  const updateProfile = (field: keyof typeof profile, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        setError("Your session has expired. Please sign in again.");
        return;
      }

      const profileUpdate = {
        id: user.id,
        full_name: profile.contactName || profile.companyName,
        phone: profile.phone,
        account_type: "agent",
      };

      const { error: profileError } = await supabase.from("profiles").upsert(profileUpdate, {
        onConflict: "id",
      });

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.contactName || profile.companyName,
          phone: profile.phone,
          account_type: "agent",
        },
      });

      if (authError) throw authError;

      localStorage.setItem("amdern_notifications", JSON.stringify(notifications));
      setMessage("Your profile and notification settings have been saved.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to save settings.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground-strong">
          Account & Profile Settings
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Manage your company details, contact information, and notification preferences.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <Card className="p-8">
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your account settings...
          </div>
        </Card>
      ) : (
        <>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground-strong">Company Profile</h3>
                <p className="text-xs text-foreground-muted">
                  Your public agent/developer profile details
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-border bg-surface-1 p-4">
                <div className="flex size-14 items-center justify-center rounded-xl bg-white p-1.5 shadow-2xs border border-border shrink-0">
                  <img
                    src="/adn-logo.png"
                    alt="Amdern Properties Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Company Logo
                  </p>
                  <p className="text-sm font-semibold text-foreground-strong">
                    Amdern Properties SMC Limited (ADN Logo)
                  </p>
                  <p className="text-xs text-foreground-muted">
                    Official registered logo in use across the platform
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={profile.companyName}
                  onChange={(e) => updateProfile("companyName", e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="contactName">Contact Person</Label>
                <Input
                  id="contactName"
                  value={profile.contactName}
                  onChange={(e) => updateProfile("contactName", e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateProfile("email", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => updateProfile("phone", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => updateProfile("website", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Office Address</Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => updateProfile("address", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="about">About</Label>
                <Textarea
                  id="about"
                  value={profile.about}
                  onChange={(e) => updateProfile("about", e.target.value)}
                  rows={3}
                  className="mt-1.5"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground-strong">
                  Notification Preferences
                </h3>
                <p className="text-xs text-foreground-muted">
                  Choose how you want to receive leads and updates
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground-strong">Email notifications</p>
                  <p className="text-xs text-foreground-muted">
                    Receive lead emails directly to your inbox
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(v) => setNotifications({ ...notifications, email: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground-strong">
                    WhatsApp notifications
                  </p>
                  <p className="text-xs text-foreground-muted">
                    Get instant WhatsApp alerts for new leads
                  </p>
                </div>
                <Switch
                  checked={notifications.whatsapp}
                  onCheckedChange={(v) => setNotifications({ ...notifications, whatsapp: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground-strong">Phone call alerts</p>
                  <p className="text-xs text-foreground-muted">
                    Get notified when someone calls from a listing
                  </p>
                </div>
                <Switch
                  checked={notifications.calls}
                  onCheckedChange={(v) => setNotifications({ ...notifications, calls: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground-strong">New lead alerts</p>
                  <p className="text-xs text-foreground-muted">
                    Instant notification for every new enquiry
                  </p>
                </div>
                <Switch
                  checked={notifications.newLeads}
                  onCheckedChange={(v) => setNotifications({ ...notifications, newLeads: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground-strong">
                    Weekly performance report
                  </p>
                  <p className="text-xs text-foreground-muted">
                    Summary of views, leads, and listing performance
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyReport}
                  onCheckedChange={(v) => setNotifications({ ...notifications, weeklyReport: v })}
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button className="btn-primary" onClick={() => void handleSave()} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
