import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ChevronDown, Menu, Heart, User, LogOut, LayoutDashboard, Phone, MessageSquare, Sun, Moon } from "lucide-react";
import { Logo } from "./Logo";
import { MobileNavigationDrawer } from "./MobileNavigationDrawer";
import { CURRENCIES, REGIONS } from "@/lib/site";
import { useCurrency } from "@/hooks/use-currency";
import { useTheme } from "@/hooks/use-theme";

type MenuItem = { label: string; to: string; search?: Record<string, string>; id?: string };

const MENUS: { label: string; groups: { heading?: string; items: MenuItem[] }[] }[] = [
  {
    label: "Buy",
    groups: [
      {
        items: [
          { label: "Houses for Sale", to: "/for-sale/houses", id: "001" },
          { label: "Flats & Apartments for Sale", to: "/for-sale/flats-apartments", id: "002" },
          { label: "Land & Plots for Sale", to: "/for-sale/land", id: "003" },
          { label: "Commercial Property for Sale", to: "/for-sale/commercial", id: "004" },
          { label: "Cars for Sale", to: "/for-sale/vehicles", id: "005" },
          { label: "View all properties for sale", to: "/for-sale", id: "006" },
        ],
      },
    ],
  },
  {
    label: "Rent",
    groups: [
      {
        items: [
          { label: "Houses for Rent", to: "/for-rent/houses", id: "101" },
          { label: "Flats & Apartments for Rent", to: "/for-rent/flats-apartments", id: "102" },
          { label: "Land & Plots for Rent", to: "/for-rent/land", id: "103" },
          { label: "Commercial Property for Rent", to: "/for-rent/commercial", id: "104" },
          { label: "Cars for Rent", to: "/for-rent/vehicles", id: "105" },
          { label: "View all properties for rent", to: "/for-rent", id: "106" },
        ],
      },
    ],
  },
  {
    label: "Companies",
    groups: [
      {
        items: [
          { label: "Estate agents", to: "/agents", id: "201" },
          { label: "Property developers", to: "/developers", id: "202" },
        ],
      },
    ],
  },
  {
    label: "About",
    groups: [
      {
        items: [
          { label: "Our CEO & Founder", to: "/about", id: "301" },
        ],
      },
    ],
  },
  {
    label: "Requests",
    groups: [
      {
        items: [
          { label: "Post a request", to: "/requests/new", id: "401" },
          { label: "View property requests", to: "/requests", id: "402" },
        ],
      },
    ],
  },
  {
    label: "Blog",
    groups: [
      {
        items: [
          { label: "All Work Updates & Articles", to: "/blog", id: "601" },
          { label: "Project & Site Updates", to: "/blog", id: "602" },
          { label: "Land & Building Guides", to: "/blog", id: "603" },
        ],
      },
    ],
  },
];

function DesktopHeader() {
  const [open, setOpen] = useState<string | null>(null);
  const { currency, setCurrencyCode } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="hidden w-full border-b border-divider bg-card xl:block">
      <div className="mx-auto flex h-16 max-w-content items-center gap-6 px-6">
        <Logo />

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {MENUS.map((m) => (
            <div
              key={m.label}
              className="relative"
              onMouseEnter={() => setOpen(m.label)}
              onMouseLeave={() => setOpen(null)}
            >
              <button
                onClick={() => setOpen(open === m.label ? null : m.label)}
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-bold text-foreground-strong hover:bg-surface-1"
                aria-expanded={open === m.label}
              >
                {m.label}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              {open === m.label && (
                <div className="absolute right-0 top-full w-64 pt-1 z-50">
                  <div className="rounded-2xl border border-border bg-card p-2 shadow-popover">
                    {m.groups.map((g, gi) => (
                      <div key={gi}>
                        {g.items.map((it) => (
                          <Link
                            key={it.label}
                            to={it.to}
                            search={it.search as never}
                            onClick={() => setOpen(null)}
                            className="block rounded-md px-3 py-2 text-sm font-semibold text-foreground-strong hover:bg-surface-1"
                          >
                            {it.label}
                          </Link>
                        ))}
                        {m.label === "Buy" || m.label === "Rent" ? (
                          <div className="mt-2 border-t border-border pt-2">
                            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                              Browse by location
                            </p>
                            {REGIONS.slice(0, 2).map((r) => (
                              <Link
                                key={r.slug}
                                to="/search"
                                search={
                                  {
                                    listing: m.label.toLowerCase() === "buy" ? "sale" : "rent",
                                    location: r.name,
                                  } as never
                                }
                                onClick={() => setOpen(null)}
                                className="block rounded-md px-3 py-1.5 text-sm hover:bg-surface-1"
                              >
                                {r.name}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <select
            value={currency.code}
            onChange={(e) => setCurrencyCode(e.target.value)}
            aria-label="Currency"
            className="hidden rounded-md border border-input bg-background px-2 py-1.5 text-xs font-bold text-foreground-strong sm:block"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <Link
            to="/saved"
            className="hidden h-9 w-9 place-items-center rounded-md border border-input hover:bg-secondary sm:grid"
            aria-label="Saved properties"
          >
            <Heart className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="hidden h-9 w-9 place-items-center rounded-md border border-input hover:bg-secondary sm:grid"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <Link to="/signin" className="btn-base btn-outline hidden sm:inline-flex">
            <User className="h-4 w-4" /> Sign in
          </Link>
          <Link
            to="/register"
            className="btn-base btn-primary hover:btn-primary-hover hidden sm:inline-flex"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}

function MobileHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setDrawerOpen(true);
    window.addEventListener("open-mobile-drawer", handleOpen);
    return () => window.removeEventListener("open-mobile-drawer", handleOpen);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-border bg-white dark:bg-card px-2.5 sm:px-4 xl:hidden shadow-xs">
      <Logo />

      <div className="flex items-center gap-1.5">
        <a
          href="tel:+256702104499"
          className="inline-flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          aria-label="Call Amdern Office"
          title="Call office"
        >
          <Phone className="h-3.5 w-3.5" />
        </a>

        <a
          href="https://wa.me/256702104499?text=Hello%20AMDERN%20PROPERTIES%2C%20I%20am%20inquiring%20about%20a%20property."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
          aria-label="Chat on WhatsApp"
          title="WhatsApp chat"
        >
          <MessageSquare className="h-3.5 w-3.5" />
        </a>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex size-8 items-center justify-center rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs ml-0.5"
          aria-label="Open mobile navigation menu"
          aria-expanded={drawerOpen}
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {/* Amdern Mobile Navigation Drawer */}
      <MobileNavigationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}

export { MobileNavigationDrawer };

export function Header() {
  return (
    <>
      <DesktopHeader />
      <MobileHeader />
    </>
  );
}
