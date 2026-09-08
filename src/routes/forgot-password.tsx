import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { Page } from "@/components/site/Page";
import { resetPasswordForEmail } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Amdern Properties SMC" },
      {
        name: "description",
        content:
          "Enter your email and we'll send you a secure link to reset your Amdern Properties account password.",
      },
      { property: "og:title", content: "Reset your password — Amdern Properties SMC" },
      {
        property: "og:description",
        content: "Get a password reset link sent to your email.",
      },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await resetPasswordForEmail(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <section className="bg-surface-1">
        <div className="mx-auto max-w-content px-6 pb-10 lg:py-12 pt-10">
          <div className="mx-auto max-w-lg">
            <div className="mb-8">
              <h1 className="font-bold text-foreground-strong text-[1.75rem] leading-[1.15] tracking-[-0.02em] sm:text-4xl">
                Reset your password
              </h1>
              <p className="mt-2 text-sm text-foreground-muted sm:text-base">
                Enter the email address associated with your account and we'll send you a link to
                reset your password.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
              {success ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10">
                    <ShieldCheck className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground-strong">Check your email</h2>
                    <p className="mt-1 text-sm text-foreground-muted">
                      If an account exists for <strong>{email}</strong>, we've sent a password reset
                      link. Please check your inbox and spam folder.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <Link to="/signin" className="btn-base btn-primary hover:btn-primary-hover">
                      Back to Sign in
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setSuccess(false);
                        setEmail("");
                      }}
                      className="btn-base btn-outline"
                    >
                      Try another email
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5" noValidate>
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
                        className="w-full h-10 pl-3 pr-9 rounded-sm border bg-white text-sm text-foreground placeholder:text-muted-foreground-2 transition-colors focus:outline-none border-border hover:border-border-strong focus:ring-[3px] focus:ring-focus-ring"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                        <Mail className="h-4 w-4" />
                      </span>
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
                    {busy ? "Sending..." : "Send reset link"} <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="text-center text-sm text-foreground-muted">
                    Remember your password?{" "}
                    <Link to="/signin" className="font-semibold text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
}
