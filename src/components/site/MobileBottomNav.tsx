import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Home, Search, PlusCircle, Heart, Menu } from "lucide-react";

export function MobileBottomNav({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const updateSaved = () => {
      try {
        const raw = localStorage.getItem("saved_properties");
        if (raw) {
          const list = JSON.parse(raw);
          setSavedCount(Array.isArray(list) ? list.length : 0);
        } else {
          setSavedCount(0);
        }
      } catch {
        setSavedCount(0);
      }
    };

    updateSaved();
    window.addEventListener("storage", updateSaved);
    window.addEventListener("saved-change", updateSaved);
    return () => {
      window.removeEventListener("storage", updateSaved);
      window.removeEventListener("saved-change", updateSaved);
    };
  }, []);

  const isHome = currentPath === "/";
  const isSearch =
    currentPath.startsWith("/search") ||
    currentPath.startsWith("/for-sale") ||
    currentPath.startsWith("/for-rent");
  const isSaved = currentPath.startsWith("/saved");

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="fixed bottom-0 left-0 right-0 z-40 block xl:hidden border-t border-border bg-white/95 dark:bg-card/95 shadow-[0_-6px_18px_rgba(15,23,42,0.08)] backdrop-blur-sm pb-[max(0.35rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex h-[58px] max-w-lg items-end justify-around px-1 sm:px-2">
        {/* Home */}
        <Link
          to="/"
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 pb-1 pt-1.5 text-[10px] font-bold leading-none transition-all ${
            isHome ? "text-primary font-extrabold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Home className={`h-4.5 w-4.5 shrink-0 transition-transform ${isHome ? "scale-110" : ""}`} />
          <span className="truncate">Home</span>
        </Link>

        {/* Search / Explore */}
        <Link
          to="/search"
          search={{ listing: "sale" } as never}
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 pb-1 pt-1.5 text-[10px] font-bold leading-none transition-all ${
            isSearch ? "text-primary font-extrabold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Search className={`h-4.5 w-4.5 shrink-0 transition-transform ${isSearch ? "scale-110" : ""}`} />
          <span className="truncate">Explore</span>
        </Link>

        {/* Center CTA: Post Request / List */}
        <Link
          to="/requests/new"
          className="relative -top-2.5 flex flex-1 flex-col items-center justify-center group"
          aria-label="Post Property Request"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-primary via-red-500 to-red-600 text-white shadow-[0_10px_20px_rgba(220,38,38,0.32)] ring-3 ring-white/90 group-active:scale-95 transition-all duration-200 group-hover:shadow-[0_12px_22px_rgba(220,38,38,0.38)]">
            <PlusCircle className="h-5 w-5 stroke-[2.2]" />
          </div>
          <span className="mt-1 text-[9px] font-extrabold leading-none tracking-tight text-slate-800 dark:text-slate-200">
            Post
          </span>
        </Link>

        {/* Saved Properties */}
        <Link
          to="/saved"
          className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 pb-1 pt-1.5 text-[10px] font-bold leading-none transition-all ${
            isSaved ? "text-primary font-extrabold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <div className="relative">
            <Heart
              className={`h-4.5 w-4.5 shrink-0 transition-transform ${isSaved ? "scale-110 fill-primary" : ""}`}
            />
            {savedCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[8px] font-bold text-white shadow-xs">
                {savedCount > 9 ? "9+" : savedCount}
              </span>
            )}
          </div>
          <span className="truncate">Saved</span>
        </Link>

        {/* Menu Toggle */}
        <button
          type="button"
          onClick={() => {
            if (onOpenMenu) {
              onOpenMenu();
            } else {
              window.dispatchEvent(new CustomEvent("open-mobile-drawer"));
            }
          }}
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 pb-1 pt-1.5 text-[10px] font-bold leading-none text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          aria-label="Open full menu"
        >
          <Menu className="h-4.5 w-4.5 shrink-0" />
          <span className="truncate">Menu</span>
        </button>
      </div>
    </nav>
  );
}
