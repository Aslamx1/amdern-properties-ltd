import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  User,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Heart,
  Bell,
  MessageCircle,
  PlusSquare,
  ArrowRight,
  Fingerprint,
} from "lucide-react";
import { Page } from "@/components/site/Page";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle, signInWithPasskey } from "@/lib/auth";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in to your account — Amdern Properties SMC" },
      {
        name: "description",
        content:
          "Sign in to manage your saved properties, listings and enquiries on Amdern Properties.",
      },
      { property: "og:title", content: "Sign in — Amdern Properties SMC" },
      {
        property: "og:description",
        content: "Manage your saved properties, listings and enquiries.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (err) {
        setError(err.message);
        return;
      }
      navigate({ to: "/dashboard" });
    } catch (e) {
      setBusy(false);
      setError("An unexpected error occurred. Please try again.");
    }
  }

  async function handleGoogleSignIn() {
    setGoogleBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
      setGoogleBusy(false);
    }
  }

  async function handlePasskeySignIn() {
    setPasskeyBusy(true);
    setError(null);
    try {
      await signInWithPasskey();
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Passkey sign-in failed. Please try again.");
      setPasskeyBusy(false);
    }
  }

  return (
    <Page>
      <section className="bg-surface-1">
        <div className="mx-auto max-w-content px-6 pb-10 lg:py-12 pt-10">
          <div className="mb-8">
            <h1 className="font-bold text-foreground-strong text-[1.75rem] leading-[1.15] tracking-[-0.02em] sm:text-4xl lg:text-[2.625rem] lg:leading-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-foreground-muted sm:text-base">
              Sign in to manage your saved listings, message agents, and pick up where you left off
              across Amdern Properties.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <form onSubmit={onSubmit} className="space-y-6" noValidate>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold tracking-[-0.015em] text-foreground-strong sm:text-xl">
                      Sign in to your account
                    </h2>
                    <p className="mt-1.5 hidden text-sm text-foreground-muted sm:block">
                      Fill in your email with your password. Required fields are marked with *.
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface-1 px-2 py-1 text-xs font-medium text-foreground-muted">
                    <ShieldCheck className="h-3.5 w-3.5 text-success" />
                    <span className="hidden md:inline">Secure connection</span>
                    <span className="md:hidden">Secure</span>
                  </span>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-semibold text-foreground-strong"
                    >
                      Email address <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full h-10 pl-3 pr-9 rounded-sm border bg-white text-sm max-sm:text-base text-foreground placeholder:text-muted-foreground-2 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-2 disabled:text-muted-foreground border-border hover:border-border-strong focus:ring-[3px] focus:ring-focus-ring"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                        <Mail className="h-4 w-4" />
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-sm font-semibold text-foreground-strong"
                    >
                      Password <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder=""
                        className="w-full h-10 pl-3 pr-10 rounded-sm border bg-white text-sm max-sm:text-base text-foreground placeholder:text-muted-foreground-2 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-2 disabled:text-muted-foreground border-border hover:border-border-strong focus:ring-[3px] focus:ring-focus-ring"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="remember"
                          checked={remember}
                          onChange={(e) => setRemember(e.target.checked)}
                          className="peer sr-only"
                        />
                        <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-[6px] border border-border-strong bg-white text-white transition-colors peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:ring-[3px] peer-focus-visible:ring-focus-ring">
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="text-xs font-medium text-foreground-strong sm:text-sm">
                          Keep me signed in
                        </span>
                      </label>
                      <Link to="/forgot-password" className="text-xs font-semibold text-destructive hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  {error && (
                    <p className="rounded-md bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                      {error}
                    </p>
                  )}
                </div>

                <div className="mt-5">
                  <div className="my-4 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span className="h-px flex-1 bg-border" /> or{" "}
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleBusy}
                    className="appearance-none inline-flex items-center justify-center font-semibold whitespace-nowrap rounded-pill cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:cursor-not-allowed bg-white text-foreground-strong border border-border hover:bg-surface-1 h-12 px-6 text-base gap-2 w-full"
                  >
                    {googleBusy ? (
                      "Connecting..."
                    ) : (
                      <>
                        <svg className="size-[18px] shrink-0" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="hidden lg:block">
                <hr className="my-6 border-border" />
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-foreground-muted">
                    New to Amdern Properties?{" "}
                    <Link to="/register" className="font-semibold text-primary hover:underline">
                      Create an account
                    </Link>
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("");
                        setPassword("");
                        setError(null);
                      }}
                      className="btn-base btn-outline h-10 px-5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={busy}
                      className="btn-base btn-primary hover:btn-primary-hover h-10 px-5 text-sm gap-2 rounded-pill disabled:opacity-60"
                    >
                      {busy ? "Signing in..." : "Sign in"} <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-base btn-primary hover:btn-primary-hover h-10 px-5 text-sm gap-2 w-full rounded-pill disabled:opacity-60"
                >
                  {busy ? "Signing in..." : "Sign in"} <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-4 text-center text-sm text-foreground-muted">
                  New to Amdern Properties?{" "}
                  <Link to="/register" className="font-semibold text-primary hover:underline">
                    Create an account
                  </Link>
                </p>
              </div>
            </form>

            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-[0.9375rem] font-bold tracking-[-0.01em] text-foreground-strong">
                  Once you&apos;re signed in
                </h3>
                <ul className="mt-4 space-y-4">
                  <li className="flex items-center gap-3 text-sm text-foreground-muted">
                    <Heart className="h-5 w-5 text-primary" /> Saved listings
                    <span className="text-xs text-muted-foreground">
                      Jump back into the properties you bookmarked.
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground-muted">
                    <Bell className="h-5 w-5 text-primary" /> Active alerts
                    <span className="text-xs text-muted-foreground">
                      See new listings matching your saved searches.
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground-muted">
                    <MessageCircle className="h-5 w-5 text-primary" /> Open messages
                    <span className="text-xs text-muted-foreground">
                      Pick up replies from agents and developers.
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground-muted">
                    <PlusSquare className="h-5 w-5 text-primary" /> Posted listings
                    <span className="text-xs text-muted-foreground">
                      Manage and renew the listings you&apos;ve posted.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handlePasskeySignIn}
                        disabled={passkeyBusy}
                        className="appearance-none inline-flex items-center justify-center font-semibold whitespace-nowrap rounded-pill cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:cursor-not-allowed bg-white text-foreground-strong border border-border hover:bg-surface-1 h-12 px-6 text-base gap-2 w-full"
                      >
                        {passkeyBusy ? (
                          "Verifying..."
                        ) : (
                          <>
                            <Fingerprint className="h-5 w-5" />
                            Sign in with a passkey
                          </>
                        )}
                      </button>
                <p className="text-xs text-foreground-muted px-1">
                  Use your fingerprint, face, or device PIN — no password to type.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-extrabold text-foreground-strong sm:text-xl">
              We&apos;ve got you
            </h2>
            <p className="mt-1 text-sm text-foreground-muted">
              Recover access, reach our support team, or check our FAQs — we usually reply within a
              few hours.
            </p>
            <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              <button className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-surface-1 text-left">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="mt-3 text-sm font-bold text-foreground-strong">
                  Reset your password
                </h3>
                <p className="mt-1 text-xs text-foreground-muted">
                  Get a reset link by email in under a minute.
                </p>
              </button>
              <Link
                to="/contact"
                className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-surface-1"
              >
                <Mail className="h-5 w-5 text-primary" />
                <h3 className="mt-3 text-sm font-bold text-foreground-strong">Email support</h3>
                <p className="mt-1 text-xs text-foreground-muted">
                  amdernsmcpropertiesltd@gmail.com
                </p>
              </Link>
              <Link
                to="/help"
                className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-surface-1"
              >
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-3 text-sm font-bold text-foreground-strong">Account FAQs</h3>
                <p className="mt-1 text-xs text-foreground-muted">
                  Common sign-in and account questions.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
}
