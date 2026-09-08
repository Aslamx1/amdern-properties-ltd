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
      className="fixed bottom-0 left-0 right-0 z-40 block xl:hidden border-t border-border bg-white dark:bg-card shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[max(0.35rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex h-14 max-w-lg items-center justify-around px-1 sm:px-2">
        {/* Home */}
        <Link
          to="/"
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-[11px] font-bold transition-all ${
            isHome ? "text-primary font-extrabold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Home className={`h-5 w-5 shrink-0 transition-transform ${isHome ? "scale-110" : ""}`} />
          <span className="truncate">Home</span>
        </Link>

        {/* Search / Explore */}
        <Link
          to="/search"
          search={{ listing: "sale" } as never}
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-[11px] font-bold transition-all ${
            isSearch ? "text-primary font-extrabold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Search className={`h-5 w-5 shrink-0 transition-transform ${isSearch ? "scale-110" : ""}`} />
          <span className="truncate">Explore</span>
        </Link>

        {/* Center CTA: Post Request / List */}
        <Link
          to="/requests/new"
          className="relative -top-2.5 flex flex-1 flex-col items-center justify-center group"
          aria-label="Post Property Request"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-red-600 text-white shadow-md shadow-primary/30 group-active:scale-95 transition-transform">
            <PlusCircle className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 tracking-tight mt-0.5">
            Post
          </span>
        </Link>

        {/* Saved Properties */}
        <Link
          to="/saved"
          className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-[11px] font-bold transition-all ${
            isSaved ? "text-primary font-extrabold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <div className="relative">
            <Heart
              className={`h-5 w-5 shrink-0 transition-transform ${isSaved ? "scale-110 fill-primary" : ""}`}
            />
            {savedCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white shadow-xs">
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
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          aria-label="Open full menu"
        >
          <Menu className="h-5 w-5 shrink-0" />
          <span className="truncate">Menu</span>
        </button>
      </div>
    </nav>
  );
}
