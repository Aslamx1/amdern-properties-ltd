import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { Page } from "@/components/site/Page";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Amdern Properties SMC" },
      {
        name: "description",
        content: "Enter your new password to complete the password reset process.",
      },
      { property: "og:title", content: "Set a new password — Amdern Properties SMC" },
      {
        property: "og:description",
        content: "Create a new password for your account.",
      },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setValidSession(!!session);
      setSessionChecked(true);
    }
    void checkSession();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setBusy(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setBusy(false);
      return;
    }

    try {
      const { error: err } = await supabase.auth.updateUser({
        password,
      });

      if (err) {
        setError(err.message);
        setBusy(false);
        return;
      }

      await supabase.auth.signOut();
      navigate({ to: "/signin", search: { reset: "success" } as any });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password. Please try again.");
      setBusy(false);
    }
  }

  if (!sessionChecked) {
    return (
      <Page>
        <section className="bg-surface-1">
          <div className="mx-auto max-w-content px-6 pb-10 lg:py-12 pt-10">
            <div className="mx-auto max-w-lg">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
                <p className="text-sm text-foreground-muted">Verifying reset link...</p>
              </div>
            </div>
          </div>
        </section>
      </Page>
    );
  }

  if (!validSession) {
    return (
      <Page>
        <section className="bg-surface-1">
          <div className="mx-auto max-w-content px-6 pb-10 lg:py-12 pt-10">
            <div className="mx-auto max-w-lg">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center space-y-4">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
                  <ShieldCheck className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground-strong">Invalid or expired link</h2>
                  <p className="mt-1 text-sm text-foreground-muted">
                    This password reset link is invalid or has expired. Please request a new one.
                  </p>
                </div>
                <Link to="/forgot-password" className="btn-base btn-primary hover:btn-primary-hover">
                  Request new link
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Page>
    );
  }

  return (
    <Page>
      <section className="bg-surface-1">
        <div className="mx-auto max-w-content px-6 pb-10 lg:py-12 pt-10">
          <div className="mx-auto max-w-lg">
            <div className="mb-8">
              <h1 className="font-bold text-foreground-strong text-[1.75rem] leading-[1.15] tracking-[-0.02em] sm:text-4xl">
                Set a new password
              </h1>
              <p className="mt-2 text-sm text-foreground-muted sm:text-base">
                Create a strong password for your account.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-semibold text-foreground-strong"
                  >
                    New password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=""
                      className="w-full h-10 pl-3 pr-10 rounded-sm border bg-white text-sm text-foreground placeholder:text-muted-foreground-2 transition-colors focus:outline-none border-border hover:border-border-strong focus:ring-[3px] focus:ring-focus-ring"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">At least 8 characters.</p>
                </div>

                <div>
                  <label
                    htmlFor="confirm_password"
                    className="mb-1.5 block text-sm font-semibold text-foreground-strong"
                  >
                    Confirm new password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirm_password"
                      type={showConfirm ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder=""
                      className="w-full h-10 pl-3 pr-10 rounded-sm border bg-white text-sm text-foreground placeholder:text-muted-foreground-2 transition-colors focus:outline-none border-border hover:border-border-strong focus:ring-[3px] focus:ring-focus-ring"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="rounded-md bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="btn-base btn-primary hover:btn-primary-hover w-full disabled:opacity-60"
                >
                  {busy ? "Updating..." : "Update password"} <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
}
