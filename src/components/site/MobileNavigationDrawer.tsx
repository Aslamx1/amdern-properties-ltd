import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  X,
  Home,
  Tag,
  Key,
  Users,
  FileText,
  TrendingUp,
  HelpCircle,
  Mail,
  ChevronRight,
  User,
  LogOut,
  LayoutDashboard,
  Heart,
  SlidersHorizontal,
  Coins,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  Phone,
  Lock,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";
import { CURRENCIES, SITE } from "@/lib/site";
import { useCurrency } from "@/hooks/use-currency";
import { useTheme } from "@/hooks/use-theme";

export type TextSizeOption = "A" | "A+" | "A++";

export interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialCurrency?: string;
  onCurrencyChange?: (currencyCode: string) => void;
  onTextSizeChange?: (size: TextSizeOption) => void;
}

type MenuItem = {
  label: string;
  to: string;
  search?: Record<string, string>;
};

type MenuCategory = {
  id: string;
  label: string;
  icon: typeof Home;
  to?: string;
  search?: Record<string, string>;
  subItems?: MenuItem[];
};

const MENU_ITEMS: MenuCategory[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    to: "/",
  },
  {
    id: "buy",
    label: "Buy",
    icon: Tag,
    subItems: [
      { label: "Houses for Sale", to: "/for-sale/houses" },
      { label: "Flats & Apartments for Sale", to: "/for-sale/flats-apartments" },
      { label: "Land & Plots for Sale", to: "/for-sale/land" },
      { label: "Commercial Property for Sale", to: "/for-sale/commercial" },
      { label: "Cars for Sale", to: "/for-sale/vehicles" },
      { label: "View all properties for sale", to: "/for-sale" },
    ],
  },
  {
    id: "rent",
    label: "Rent",
    icon: Key,
    subItems: [
      { label: "Houses for Rent", to: "/for-rent/houses" },
      { label: "Flats & Apartments for Rent", to: "/for-rent/flats-apartments" },
      { label: "Land & Plots for Rent", to: "/for-rent/land" },
      { label: "Commercial Property for Rent", to: "/for-rent/commercial" },
      { label: "Cars for Rent", to: "/for-rent/vehicles" },
      { label: "View all properties for rent", to: "/for-rent" },
    ],
  },
  {
    id: "companies",
    label: "Companies",
    icon: Users,
    subItems: [
      { label: "Estate agents", to: "/agents" },
      { label: "Property developers", to: "/developers" },
    ],
  },
  {
    id: "about",
    label: "About",
    icon: Users,
    subItems: [{ label: "Our CEO & Founder", to: "/about" }],
  },
  {
    id: "requests",
    label: "Requests",
    icon: FileText,
    subItems: [
      { label: "Post a request", to: "/requests/new" },
      { label: "View property requests", to: "/requests" },
    ],
  },
  {
    id: "blog",
    label: "Work Blog & Guides",
    icon: FileText,
    to: "/blog",
  },
];

export function MobileNavigationDrawer({
  isOpen,
  onClose,
  initialCurrency = "UGX",
  onCurrencyChange,
  onTextSizeChange,
}: MobileNavigationDrawerProps) {
  // Navigation accordions state
  const [expandedTabs, setExpandedTabs] = useState<Record<string, boolean>>({});

  // Preferences states
  const [fontSize, setFontSize] = useState<TextSizeOption>("A");
  const { currency, setCurrencyCode } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Restore saved preferences on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFontSize = localStorage.getItem("amdern_font_size") as TextSizeOption | null;
      if (savedFontSize && ["A", "A+", "A++"].includes(savedFontSize)) {
        setFontSize(savedFontSize);
        applyTextSize(savedFontSize);
      }

      const savedCurrency = localStorage.getItem("amdern_currency");
      if (savedCurrency) {
        setCurrencyCode(savedCurrency);
      }
    }
  }, []);

  // Lock body scroll when drawer or modals are open
  useEffect(() => {
    if (isOpen || currencyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, currencyModalOpen]);

  // Handle Escape key to close drawer/modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (currencyModalOpen) {
          setCurrencyModalOpen(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currencyModalOpen, onClose]);

  // Accordion toggle handler
  const toggleTab = (id: string) => {
    setExpandedTabs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Text size change handler
  const handleTextSizeChange = (size: TextSizeOption) => {
    setFontSize(size);
    applyTextSize(size);
    if (typeof window !== "undefined") {
      localStorage.setItem("amdern_font_size", size);
    }
    onTextSizeChange?.(size);
  };

  const applyTextSize = (size: TextSizeOption) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (size === "A") {
      root.style.fontSize = "100%"; // 16px
    } else if (size === "A+") {
      root.style.fontSize = "108%"; // ~17.3px
    } else if (size === "A++") {
      root.style.fontSize = "118%"; // ~18.9px
    }
  };

  // Currency select handler
  const handleCurrencySelect = (code: string) => {
    setCurrencyCode(code);
    onCurrencyChange?.(code);
    setCurrencyModalOpen(false);
  };

  const activeCurrencyObj = currency;

  if (!isOpen && !currencyModalOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Mobile Drawer — Clean White Theme */}
      <aside
        ref={drawerRef}
        aria-label="Mobile Navigation"
        className="fixed inset-y-0 left-0 z-[70] flex h-full w-[88vw] max-w-[380px] flex-col bg-white text-slate-800 shadow-2xl transition-transform duration-300 ease-out sm:max-w-[400px] border-r border-slate-200 animate-in slide-in-from-left duration-200"
      >
        {/* Drawer Header: ADN Logo & Company Name */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-3.5 sm:px-5 bg-white">
          <Link to="/" onClick={onClose} className="flex min-w-0 items-center gap-2.5 sm:gap-3 group">
            {/* ADN Logo Emblem */}
            <div className="relative flex size-10 items-center justify-center rounded-xl bg-slate-50 p-1 shadow-xs border border-slate-200 shrink-0">
              <img
                src="/adn-logo.png"
                alt="ADN Amdern Properties"
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/adn-logo.svg";
                }}
              />
            </div>
            <div className="flex min-w-0 flex-col leading-none">
              <span className="text-xs sm:text-[13px] font-extrabold tracking-tight text-slate-900 group-hover:text-primary transition-colors truncate">
                AMDERN PROPERTIES
              </span>
              <span className="text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase mt-0.5 truncate">
                SMC LIMITED
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-300">
          {/* Top Auth Links Section */}
          <div className="space-y-2.5">
            <div className="flex flex-col gap-2.5">
              <Link
                to="/signin"
                onClick={onClose}
                className="w-full flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-100"
              >
                <User className="size-4 mr-2" /> Sign in
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="w-full flex items-center justify-center rounded-xl px-4 py-3 text-sm font-extrabold text-white shadow-sm hover:opacity-90"
                style={{ backgroundColor: "var(--primary, #dc2626)" }}
              >
                <span>Register</span>
              </Link>
            </div>
          </div>

          {/* Navigation Menu List */}
          <nav className="space-y-1" aria-label="Main navigation items">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
              const isExpanded = expandedTabs[item.id] || false;

              if (!hasSubItems && item.to) {
                return (
                  <Link
                    key={item.id}
                    to={item.to}
                    search={item.search as never}
                    onClick={onClose}
                    className="flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 hover:text-slate-950 transition-colors"
                  >
                    <span className="flex items-center gap-3.5">
                      <Icon className="size-4.5 text-slate-600 group-hover:text-primary" />
                      <span>{item.label}</span>
                    </span>
                    <ChevronRight className="size-4 text-slate-400" />
                  </Link>
                );
              }

              return (
                <div key={item.id} className="rounded-xl transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleTab(item.id)}
                    aria-expanded={isExpanded}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                      isExpanded
                        ? "bg-slate-100 text-slate-950"
                        : "text-slate-800 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <span className="flex items-center gap-3.5">
                      <Icon
                        className={`size-4.5 ${isExpanded ? "text-primary font-bold" : "text-slate-600"}`}
                      />
                      <span>{item.label}</span>
                    </span>
                    <ChevronRight
                      className={`size-4 text-slate-500 transition-transform duration-200 ${
                        isExpanded ? "rotate-90 text-primary" : ""
                      }`}
                    />
                  </button>

                  {/* Accordion Sub-items */}
                  {isExpanded && item.subItems && (
                    <div className="ml-4 pl-4 my-1.5 space-y-1 border-l-2 border-slate-200">
                      {item.subItems.map((subItem, idx) => (
                        <Link
                          key={idx}
                          to={subItem.to}
                          search={subItem.search as never}
                          onClick={onClose}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                          <span>{subItem.label}</span>
                          <ChevronRight className="size-3 text-slate-400" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* PREFERENCES SECTION */}
          <div className="space-y-4 border-t border-slate-200 pt-5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Preferences
              </span>
            </div>

            {/* Text Size Control */}
            <div className="space-y-2 rounded-xl bg-slate-50 p-3 border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                  <SlidersHorizontal className="size-3.5 text-slate-500" />
                  Text size
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {fontSize === "A" ? "Standard" : fontSize === "A+" ? "Medium" : "Large"}
                </span>
              </div>

              {/* Segmented Control */}
              <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-surface-2 p-1 border border-border">
                {(["A", "A+", "A++"] as const).map((size) => {
                  const isActive = fontSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleTextSizeChange(size)}
                      style={
                        isActive
                          ? { backgroundColor: "#1e293b", color: "#ffffff" }
                          : { backgroundColor: "transparent", color: "#334155" }
                      }
                      className="flex h-8 items-center justify-center rounded-md text-xs font-extrabold transition-all cursor-pointer"
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Currency Control */}
            <button
              type="button"
              onClick={() => setCurrencyModalOpen(true)}
              className="flex w-full items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200 text-left hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-white text-slate-700 border border-slate-200 shadow-2xs">
                  <Coins className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Currency</p>
                  <p className="text-[11px] text-slate-500">{activeCurrencyObj.label}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs">
                  {currency.code}
                </span>
                <ChevronRight className="size-4 text-slate-400" />
              </div>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200 text-left hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-white text-slate-700 border border-slate-200 shadow-2xs">
                  {theme === "light" ? <Sun className="size-4 text-primary" /> : <Moon className="size-4 text-primary" />}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Theme</p>
                  <p className="text-[11px] text-slate-500">{theme === "light" ? "Light mode" : "Dark mode"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs">
                  {theme === "light" ? "☀️" : "🌙"}
                </span>
                <ChevronRight className="size-4 text-slate-400" />
              </div>
            </button>
          </div>

          {/* SUPPORT SECTION */}
          <div className="space-y-2 border-t border-slate-200 pt-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Support & Help
            </span>

            <Link
              to="/help"
              onClick={onClose}
              className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <span className="flex items-center gap-3.5">
                <HelpCircle className="size-4.5 text-slate-500" />
                <span>Help and FAQs</span>
              </span>
              <ChevronRight className="size-4 text-slate-400" />
            </Link>

            <Link
              to="/contact"
              onClick={onClose}
              className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <span className="flex items-center gap-3.5">
                <Mail className="size-4.5 text-slate-500" />
                <span>Contact us</span>
              </span>
              <ChevronRight className="size-4 text-slate-400" />
            </Link>
          </div>

          {/* Drawer Footer Branding Info */}
          <div className="border-t border-slate-200 pt-4 pb-2 text-center text-xs text-slate-500 space-y-1">
            <p className="font-bold text-slate-800">{SITE.name}</p>
            <p className="text-[11px] text-slate-600">{SITE.address}</p>
            <div className="pt-1 flex flex-wrap items-center justify-center gap-x-2 text-[11px] text-primary font-semibold">
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a>
              <span>·</span>
              <a href={`tel:${SITE.phone2.replace(/\s/g, "")}`}>{SITE.phone2}</a>
            </div>
          </div>
        </div>
      </aside>

      {/* CURRENCY SELECTION MODAL — Clean White Theme */}
      {currencyModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setCurrencyModalOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Coins className="size-5 text-primary" />
                <h3 className="text-base font-bold text-slate-900">Select Currency</h3>
              </div>
              <button
                type="button"
                onClick={() => setCurrencyModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
              {CURRENCIES.map((c) => {
                const isSelected = c.code === currency.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCurrencySelect(c.code)}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left transition-all ${
                      isSelected
                        ? "bg-primary/10 border border-primary/40 text-primary font-bold shadow-2xs"
                        : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex size-7 items-center justify-center rounded-md text-xs font-bold border ${
                          isSelected
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-slate-700 border-slate-200"
                        }`}
                      >
                        {c.symbol}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{c.label}</p>
                        <p
                          className={`text-[11px] ${isSelected ? "text-primary/80" : "text-slate-400"}`}
                        >
                          {c.code}
                        </p>
                      </div>
                    </div>

                    {isSelected && <Check className="size-5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}


    </>
  );
}
