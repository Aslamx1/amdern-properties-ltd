import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AiAssistantWidget } from "./AiAssistant";
import { MobileBottomNav } from "./MobileBottomNav";
import { Toaster } from "@/components/ui/sonner";
import { ChevronUp, X, GitCompare } from "lucide-react";
import { useEffect, useState } from "react";
import { useCompare } from "@/hooks/use-compare";
import { Link } from "@tanstack/react-router";

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1 pb-[calc(4.5rem+max(0.5rem,env(safe-area-inset-bottom)))] xl:pb-0">{children}</main>
      <Footer />
      <AiAssistantWidget />
      <MobileBottomNav />
      <Toaster />
      <BackToTop />
      <CompareBar />
    </div>
  );
}

export function PageHero({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <section className="border-b border-border bg-secondary">
      <div className="container-page py-10 sm:py-14">
        {eyebrow && (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">{subtitle}</p>
        )}
      </div>
    </section>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-[calc(4.5rem+max(0.5rem,env(safe-area-inset-bottom)))] left-4 z-40 flex size-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-colors xl:left-auto xl:bottom-6 xl:right-6"
      aria-label="Back to top"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}

function CompareBar() {
  const { items, remove, clear } = useCompare();
  const [open, setOpen] = useState(false);

  if (items.length < 2) return null;

  return (
    <div className="fixed bottom-[calc(3.75rem+max(0.35rem,env(safe-area-inset-bottom)))] left-0 right-0 z-40 xl:bottom-6">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-xl border border-border bg-white shadow-lg">
          {!open ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex w-full items-center justify-between px-4 py-3"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-foreground-strong">
                <GitCompare className="h-4 w-4 text-primary" />
                Compare {items.length} properties
              </span>
              <span className="text-xs text-muted-foreground">Tap to expand</span>
            </button>
          ) : (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-foreground-strong">
                  Comparing {items.length} properties
                </span>
                <div className="flex items-center gap-2">
                  <Link to="/compare" className="btn-base btn-primary text-xs">
                    View comparison
                  </Link>
                  <button type="button" onClick={clear} className="btn-base btn-outline text-xs">
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-md p-1 text-muted-foreground hover:text-foreground-strong transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-secondary p-2 shrink-0"
                  >
                    <div className="h-12 w-16 overflow-hidden rounded-md bg-slate-100">
                      <img
                        src={item.images[0] || "/placeholder.png"}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground-strong line-clamp-1">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground">Ref {item.ref}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="rounded-md p-1 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Remove ${item.title} from comparison`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
