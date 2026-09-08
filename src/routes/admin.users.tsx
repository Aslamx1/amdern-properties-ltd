import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Loader2,
  Search,
  ShieldAlert,
  Users as UsersIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { apiAdminUsers, apiAdminDeleteUser, type UserItem } from "@/lib/api-admin";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
  pendingComponent: () => (
    <div className="flex items-center justify-center py-20">
      <p className="text-sm text-slate-500">Loading users...</p>
    </div>
  ),
});

function AdminUsers() {
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const {
    data: usersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["adminUsers", search],
    queryFn: () => apiAdminUsers({ search, limit: 50 }),
    staleTime: 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiAdminDeleteUser(id),
    onSuccess: () => {
      setConfirmId(null);
      refetch();
    },
    onError: (e: unknown) => {
      setError(e instanceof Error ? e.message : "Failed to delete user");
    },
  });

  const users = usersData?.users ?? [];

  const filtered = users.filter((u) =>
    `${u.full_name ?? ""} ${u.account_type ?? ""} ${u.email ?? ""} ${u.phone ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="mt-1 text-sm text-slate-600">
            View and manage user accounts. Deletion is permanent and removes the login, profile and
            all associated data.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-64 rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-xs font-bold text-red-600">{error}</div>
      )}

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm font-semibold text-slate-900">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Account Type</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Consent</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u: UserItem) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{u.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{u.account_type ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{u.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {u.isAdmin ? (
                        <Badge className="bg-red-100 text-red-700">Admin</Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-600">User</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col text-xs">
                        <span
                          className={u.privacyPolicyAgreed ? "text-emerald-600" : "text-slate-400"}
                        >
                          Privacy: {u.privacyPolicyAgreed ? "Agreed" : " — "}
                        </span>
                        <span
                          className={u.marketingConsent ? "text-emerald-600" : "text-slate-400"}
                        >
                          Marketing: {u.marketingConsent ? "Opted in" : "Opted out"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.id === "current" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <ShieldAlert className="h-3.5 w-3.5" /> You
                        </span>
                      ) : confirmId === u.id ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setConfirmId(null)}>
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={busyId === u.id}
                            onClick={() => handleDelete(u.id)}
                          >
                            {busyId === u.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Delete"
                            )}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          disabled={busyId === u.id}
                          onClick={() => setConfirmId(u.id)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <UsersIcon className="h-4 w-4" />
        {filtered.length} user account{filtered.length === 1 ? "" : "s"} shown
      </div>
    </div>
  );
}
