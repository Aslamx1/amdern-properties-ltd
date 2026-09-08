import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { X, Cookie } from "lucide-react";

const CONSENT_KEY = "amdern_cookie_consent";

export type ConsentChoice = "accepted" | "rejected" | null;

interface CookieConsentContextValue {
  consent: ConsentChoice;
  setConsent: (choice: ConsentChoice) => void;
  showBanner: boolean;
}

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<ConsentChoice>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem(CONSENT_KEY) : null;
      if (saved === "accepted" || saved === "rejected") {
        setConsentState(saved);
      }
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  const setConsent = (choice: ConsentChoice) => {
    setConsentState(choice);
    if (choice) {
      try {
        localStorage.setItem(CONSENT_KEY, choice);
      } catch {
        // ignore
      }
    }
  };

  const value = {
    consent,
    setConsent,
    showBanner: ready && consent === null,
  };

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return ctx;
}

/**
 * CookieBanner — notifies visitors about session cookies and search tracking,
 * in compliance with the Uganda Data Protection and Privacy Act, 2019
 * (Article 9 — Consent; Article 13 — Cookies and similar technologies).
 *
 * Only shown when no consent preference has been recorded yet.
 */
export function CookieBanner() {
  const { consent, setConsent, showBanner } = useCookieConsent();

  if (!showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:p-6">
      <div className="mx-auto flex max-w-content flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <Cookie className="h-5 w-5 shrink-0 text-slate-600" />
          <p className="text-xs text-slate-600">
            We use essential session cookies to keep you logged in and to remember your search
            preferences (location, currency, saved listings). We do <strong>not</strong> use
            advertising or third-party tracking cookies. By clicking <strong>Accept</strong> you
            agree to our{" "}
            <Link to="/privacy-policy" className="font-semibold text-slate-900 underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link to="/terms-and-conditions" className="font-semibold text-slate-900 underline">
              Terms
            </Link>
            , in accordance with the Uganda Data Protection and Privacy Act, 2019.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setConsent("rejected")}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Reject non-essential
          </button>
          <button
            onClick={() => setConsent("accepted")}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
