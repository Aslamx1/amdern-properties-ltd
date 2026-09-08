import { createFileRoute, Link, Outlet, useLocation, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Home,
  MessageSquare,
  Settings,
  CreditCard,
  PlusCircle,
  Bell,
  Search,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Shield,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { loadProfileForUser } from "@/lib/user-profile";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw redirect({ to: "/signin" });
    }
  },
  component: DashboardLayout,
});

const NAV_ITEMS = [
  { to: "/dashboard" as const, icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/dashboard/listings" as const, icon: Home, label: "My Listings" },
  { to: "/dashboard/listings/new" as const, icon: PlusCircle, label: "Add Property" },
  { to: "/dashboard/enquiries" as const, icon: MessageSquare, label: "Enquiries & Leads" },
  { to: "/dashboard/settings" as const, icon: User, label: "Account" },
  { to: "/account/privacy" as const, icon: Shield, label: "Privacy & Data" },
  { to: "/dashboard/subscription" as const, icon: CreditCard, label: "Subscription" },
  { to: "/dashboard/settings" as const, icon: Settings, label: "Settings" },
];

function DashboardLayout() {
  const location = useLocation();
  const [user, setUser] = useState<{
    email: string | undefined;
    fullName: string | undefined;
  } | null>(null);
  const [checking, setChecking] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!cancelled) {
          if (data.user) {
            const profile = await loadProfileForUser(data.user);
            setUser({
              email: data.user.email ?? undefined,
              fullName: profile?.full_name ?? undefined,
            });
          } else {
            setUser(null);
          }
          setChecking(false);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Auth check failed:", e);
          setUser(null);
          setChecking(false);
        }
      }
    };
    void init();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!cancelled) {
        try {
          if (session?.user) {
            const profile = await loadProfileForUser(session.user);
            setUser({
              email: session.user.email ?? undefined,
              fullName: profile?.full_name ?? undefined,
            });
          } else {
            setUser(null);
          }
        } catch (e) {
          console.error("Auth state change failed:", e);
          if (!cancelled) setUser(null);
        }
      }
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!checking && !user) {
      window.location.href = "/signin";
    }
  }, [checking, user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const getUserEmail = () => user?.email || "User";
  const getUserName = () => user?.fullName || user?.email || "User";
  const getInitial = () =>
    user?.fullName
      ? user.fullName.charAt(0).toUpperCase()
      : user?.email
        ? user.email.charAt(0).toUpperCase()
        : "U";
  const currentTitle =
    NAV_ITEMS.find((item) => {
      if (item.end) return location.pathname === item.to;
      return location.pathname.startsWith(item.to);
    })?.label ?? "Dashboard";

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <p className="text-sm text-foreground-muted">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-700">
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
          id="dashboard-sidebar"
          role="navigation"
          aria-label="Dashboard sidebar"
          aria-hidden={isMobile ? !mobileOpen : false}
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white shadow-sm transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
            collapsed ? "md:w-[90px]" : "md:w-[260px]",
          )}
          data-open={mobileOpen}
        >
          <div className="flex h-[88px] items-center justify-between border-b border-slate-200 px-5">
            {!collapsed && (
              <Link to="/" className="flex items-center gap-3 group">
                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 p-1 shadow-2xs border border-slate-200 shrink-0">
                  <img
                    src="/adn-logo.png"
                    alt="Amdern Properties SMC Limited"
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/adn-logo.svg";
                    }}
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-extrabold tracking-tight text-slate-900 group-hover:text-primary transition-colors">
                    Amdern Properties
                  </span>
                  <span className="text-[9px] font-bold tracking-[0.16em] text-slate-500 uppercase">
                    SMC LIMITED
                  </span>
                </div>
              </Link>
            )}
            {collapsed && (
              <Link
                to="/"
                className="flex size-10 items-center justify-center rounded-xl bg-slate-50 p-1 shadow-2xs border border-slate-200"
              >
                <img
                  src="/adn-logo.png"
                  alt="Amdern Properties"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/adn-logo.svg";
                  }}
                />
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(false)}
              aria-controls="dashboard-sidebar"
              aria-label="Close navigation"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 md:hidden"
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
                      ? "bg-primary/10 text-primary shadow-xs ring-1 ring-primary/20 font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-3">
            <div className={cn("rounded-xl bg-slate-50 p-3", collapsed && "px-2")}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-2xs">
                  {getInitial()}
                </div>
                {!collapsed && (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{getUserName()}</p>
                    <p className="text-[11px] uppercase tracking-[0.1em] text-slate-500">
                      Account user
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className={cn(
                "mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900",
                collapsed && "justify-center px-2",
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Sign out</span>}
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
            <div className="flex h-[80px] items-center justify-between gap-3 px-4 md:px-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-controls="dashboard-sidebar"
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
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                    Amdern Properties
                  </p>
                  <h1 className="text-lg font-bold text-slate-900 md:text-xl">{currentTitle}</h1>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
                  <Search className="h-4 w-4" />
                  <input
                    aria-label="Dashboard search"
                    placeholder="Search listings"
                    className="w-36 border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
                  <Bell className="h-4 w-4" />
                </button>
                <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 sm:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {getInitial()}
                  </div>
                  <div className="hidden text-left md:block">
                    <p className="text-sm font-semibold text-slate-800">{getUserEmail()}</p>
                    <p className="text-[11px] text-slate-500">Amdern Properties SMC</p>
                  </div>
                </div>
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
