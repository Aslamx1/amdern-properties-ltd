import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Home,
  Image,
  Users,
  UserCheck,
  MessageSquare,
  Settings,
  CreditCard,
  Globe,
  Shield,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Loader2,
  BookOpen,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AdminNotificationBell } from "@/components/admin/AdminNotificationBell";
import { apiAdminLogin, apiAdminMe, apiAdminLogout, type AdminProfile } from "@/lib/api-admin";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV_ITEMS = [
  { to: "/admin" as const, icon: LayoutDashboard, label: "Executive Overview", end: true },
  { to: "/admin/listings" as const, icon: Home, label: "Listing Moderation" },
  { to: "/admin/photos" as const, icon: Image, label: "Photo Assets" },
  { to: "/admin/blog" as const, icon: BookOpen, label: "Work Blog & News" },
  { to: "/admin/verification" as const, icon: UserCheck, label: "Verification Center" },
  { to: "/admin/agents" as const, icon: Users, label: "Agencies & Agents" },
  { to: "/admin/users" as const, icon: Users, label: "User Management" },
  { to: "/admin/messages" as const, icon: MessageSquare, label: "Messages" },
  { to: "/admin/leads" as const, icon: MessageSquare, label: "Leads & Enquiries" },
  { to: "/admin/regions" as const, icon: Globe, label: "Locations & Taxonomies" },
  { to: "/admin/billing" as const, icon: CreditCard, label: "Billing & Revenue" },
  { to: "/admin/security" as const, icon: Shield, label: "Security & IP Controls" },
  { to: "/admin/settings" as const, icon: Settings, label: "System Settings" },
];

interface AdminUser {
  id: string;
  email: string | undefined;
  role?: string;
  fullName?: string;
}

function AdminLayout() {
  const location = useLocation();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Verify admin session against the real backend API.
  const checkAdminAccess = async (): Promise<AdminUser | null> => {
    try {
      const data: AdminProfile = await apiAdminMe();
      const admin = data.admin;
      if (admin.role !== "ADMIN") {
        return null;
      }
      return {
        email: admin.email,
        role: admin.role,
        fullName: admin.name,
        id: admin.id,
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const cancelled = false;
    const init = async () => {
      try {
        const admin = await checkAdminAccess();
        if (!cancelled) {
          setUser(admin);
          setChecking(false);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Auth check failed:", e);
          setChecking(false);
        }
      }
    };
    void init();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    setLoginError(null);
    try {
      const result = await apiAdminLogin(loginEmail, loginPassword);
      if (result && result.message) {
        // On success, re-check admin session
        const admin = await checkAdminAccess();
        if (admin) {
          setUser(admin);
        } else {
          setLoginError("Access denied. Not an admin account.");
          await apiAdminLogout();
        }
      }
    } catch (e: unknown) {
      setLoginError(e instanceof Error ? e.message : "Sign in failed. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await apiAdminLogout();
    setUser(null);
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Admin Control Suite</h1>
            <p className="mt-2 text-sm text-white/60">AMDERN PROPERTIES SMC LIMITED</p>
          </div>
          <form onSubmit={handleSignIn} className="surface-card space-y-4 bg-white p-6">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Admin Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold"
                placeholder="admin@amdern.com"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold"
                placeholder="••••••••"
                required
              />
            </div>
            {loginError && (
              <div className="rounded-md bg-red-50 p-3 text-xs font-bold text-red-600">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              disabled={signingIn}
              className="btn-base btn-primary hover:btn-primary-hover w-full py-2.5 text-sm"
            >
              {signingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in to Admin"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const getUserEmail = () => user?.email || "Admin";
  const getUserName = () => user?.fullName || user?.email || "Admin";
  const getInitial = () =>
    user?.fullName
      ? user.fullName.charAt(0).toUpperCase()
      : user?.email
        ? user.email.charAt(0).toUpperCase()
        : "A";
  const currentTitle =
    NAV_ITEMS.find((item) => {
      if (item.end) return location.pathname === item.to;
      return location.pathname.startsWith(item.to);
    })?.label ?? "Admin Dashboard";

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-700">
      {isMobile && mobileOpen && (
        <div
          role="presentation"
          aria-hidden={false}
          className="fixed inset-0 z-50 bg-slate-900/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        <aside
          id="admin-sidebar"
          role="navigation"
          aria-label="Admin sidebar"
          aria-hidden={isMobile ? !mobileOpen : false}
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#0F172A] text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
            collapsed ? "md:w-[90px]" : "md:w-[280px]",
          )}
        >
          <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5">
            {!collapsed && (
              <Link to="/" className="flex items-center gap-3 group">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 p-1.5">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-extrabold tracking-tight text-white">
                    AMDERN ADMIN
                  </span>
                  <span className="text-[9px] font-bold tracking-[0.16em] text-white/50 uppercase">
                    Control Suite
                  </span>
                </div>
              </Link>
            )}
            {collapsed && (
              <Link
                to="/"
                className="flex size-10 items-center justify-center rounded-xl bg-white/10 p-1.5"
              >
                <Shield className="h-5 w-5 text-white" />
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(false)}
              aria-controls="admin-sidebar"
              aria-label="Close navigation"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white/60 hover:bg-white/10 md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav role="menu" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-white/15 text-white shadow-lg font-bold"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-3">
            <div className={cn("rounded-xl bg-white/5 p-3", collapsed && "px-2")}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
                  {getInitial()}
                </div>
                {!collapsed && (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{getUserName()}</p>
                    <p className="text-[11px] uppercase tracking-[0.1em] text-white/50">
                      {user?.role || "Administrator"}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <Link
                  to="/"
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <Globe className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>View Site</span>}
                </Link>
                <button
                  onClick={handleSignOut}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>Sign out</span>}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
            <div className="flex h-[72px] items-center justify-between gap-3 px-4 md:px-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-controls="admin-sidebar"
                  aria-expanded={mobileOpen}
                  aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCollapsed((value) => !value)}
                  className="hidden h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:inline-flex"
                >
                  {collapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </button>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-red-600">
                    Amdern Properties
                  </p>
                  <h1 className="text-lg font-bold text-slate-900 md:text-xl">{currentTitle}</h1>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
                  <Search className="h-4 w-4" />
                  <input
                    aria-label="Admin search"
                    placeholder="Search listings, agents..."
                    className="w-36 border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <Link
                  to="/admin/messages"
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                >
                  <MessageSquare className="h-4 w-4" />
                </Link>
                <AdminNotificationBell />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
