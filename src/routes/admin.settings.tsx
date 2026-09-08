import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Globe, DollarSign, Users, Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

type ProfileUser = {
  id: string;
  full_name: string | null;
  phone: string | null;
  account_type: string | null;
  created_at: string;
};

function AdminSettings() {
  const [users, setUsers] = useState<ProfileUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    const { data, error: loadError } = await supabase
      .from("profiles")
      .select("id, full_name, phone, account_type, created_at")
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      setUsers([]);
    } else {
      setUsers((data as ProfileUser[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    setDeletingId(userId);
    setError(null);
    setMessage(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const { data, error: invokeError } = await supabase.functions.invoke("delete-user", {
        body: { userId },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });

      if (invokeError) {
        throw new Error(invokeError.message || "The real user deletion failed.");
      }

      if (!data?.success) {
        throw new Error("The delete-user service did not confirm user deletion.");
      }

      setUsers((current) => current.filter((user) => user.id !== userId));
      setMessage("User removed successfully.");
    } catch (err) {
      const messageText = err instanceof Error ? err.message : "Unable to delete this user.";
      setError(messageText);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          SEO metadata, user access, and platform configuration.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="h-5 w-5 text-blue-600" />
            <p className="font-semibold text-slate-900">SEO & Metadata</p>
          </div>
          <p className="text-xs text-slate-500">
            Custom SEO titles, meta descriptions, OpenGraph tags, and canonical tags for all target
            paths.
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <p className="font-semibold text-slate-900">Exchange Rates</p>
          </div>
          <p className="text-xs text-slate-500">
            Configure UGX, USD, GBP, EUR conversion rates for multi-currency display.
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Registered Users</h3>
              <p className="text-xs text-slate-500">View real account names and remove access when needed.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadUsers()}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {message && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No user profiles found yet.
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {user.full_name || "Unnamed user"}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-white px-2 py-1 capitalize">
                      {user.account_type || "seeker"}
                    </span>
                    {user.phone && <span>{user.phone}</span>}
                    <span>
                      Joined {new Date(user.created_at).toLocaleDateString("en-UG", { dateStyle: "medium" })}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleDeleteUser(user.id)}
                  disabled={deletingId === user.id}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === user.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Delete user
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-12 text-center">
        <Settings className="mx-auto h-16 w-16 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Platform Configuration</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          Manage XML sitemap parameters, set 301 redirects for sold or expired listings, and
          configure platform-wide settings.
        </p>
      </Card>
    </div>
  );
}
