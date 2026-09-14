import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Search,
  Key,
  Handshake,
  HardHat,
  ArrowRight,
  Heart,
  Bell,
  MessageCircle,
  PlusSquare,
  CheckSquare,
  Square,
} from "lucide-react";
import { Page } from "@/components/site/Page";
import { signup, type SignupPayload } from "@/lib/api-auth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create a free account — Amdern Properties SMC" },
      {
        name: "description",
        content:
          "Register free to save properties, set up alerts and list your own property on Amdern Properties.",
      },
      { property: "og:title", content: "Create a free account — Amdern Properties SMC" },
      {
        property: "og:description",
        content: "Save properties, set alerts and list your own property.",
      },
    ],
  }),
  component: Register,
});

type AccountType = "seeker" | "owner" | "agent" | "developer";

function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("seeker");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setBusy(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setBusy(false);
      return;
    }

    // Uganda Data Protection and Privacy Act, 2019 — Article 9 (Consent)
    // Explicit consent to the Privacy Policy is mandatory before the account
    // can be created. The backend enforces this server-side as well.
    if (!privacyAgreed) {
      setError(
        "You must agree to the Privacy Policy before creating an account, as required by the Uganda Data Protection and Privacy Act, 2019.",
      );
      setBusy(false);
      return;
    }

    try {
      const payload: SignupPayload = {
        name: fullName,
        email,
        password,
        role: accountType.toUpperCase() as "SEEKER" | "OWNER" | "AGENT" | "DEVELOPER" | "ADMIN",
        privacyPolicyAgreed: privacyAgreed,
        marketingConsent,
      };
      if (phone) payload.phone = phone;
      await signup(payload);

      // Navigation handled by the success view below
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <Page>
        <section className="bg-surface-1">
          <div className="mx-auto max-w-content px-6 pb-10 lg:py-12 pt-10">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10 text-center max-w-lg mx-auto">
              <h1 className="text-2xl font-extrabold">Check your email</h1>
              <p className="mt-3 text-sm text-foreground-muted">
                We sent a confirmation link to <strong>{email}</strong>. Please verify your email
                before signing in.
              </p>
              <Link
                to="/signin"
                className="btn-base btn-primary hover:btn-primary-hover mt-6 inline-flex"
              >
                Go to Sign in
              </Link>
            </div>
          </div>
        </section>
      </Page>
    );
  }

  const accountTypes: { value: AccountType; label: string; desc: string; icon: typeof Search }[] = [
    {
      value: "seeker",
      label: "Property seeker",
      desc: "Searching for property to rent, buy, or short let.",
      icon: Search,
    },
    {
      value: "owner",
      label: "Property owner",
      desc: "Listing the home or land I personally own.",
      icon: Key,
    },
    {
      value: "agent",
      label: "Estate agent",
      desc: "Representing a brokerage or independent agency.",
      icon: Handshake,
    },
    {
      value: "developer",
      label: "Property developer",
      desc: "Selling new or off-plan developments.",
      icon: HardHat,
    },
  ];

  return (
    <Page>
      <section className="bg-surface-1">
        <div className="mx-auto max-w-content px-6 pb-10 lg:py-12 pt-10">
          <div className="mb-8">
            <h1 className="font-bold text-foreground-strong text-[1.75rem] leading-[1.15] tracking-[-0.02em] sm:text-4xl lg:text-[2.625rem] lg:leading-tight">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-foreground-muted sm:text-base">
              Search thousands of listings from agents and developers across Uganda. Save listings,
              contact agents, and post your own properties.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <form onSubmit={onSubmit} className="space-y-6" noValidate>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold tracking-[-0.015em] text-foreground-strong sm:text-xl">
                      Create your own account
                    </h2>
                    <p className="mt-1.5 text-sm text-foreground-muted">
                      It only takes a minute. Required fields are marked with *.
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
                    <label className="mb-1.5 block text-sm font-semibold text-foreground-strong">
                      Account type <span className="text-destructive">*</span>
                    </label>
                    <p className="mb-2 text-xs text-foreground-muted">
                      Pick the role that fits you best. You can change this later from your account
                      settings.
                    </p>
                    <div
                      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-1"
                      role="radiogroup"
                      aria-label="Account type"
                    >
                      {accountTypes.map((at) => {
                        const Icon = at.icon;
                        const selected = accountType === at.value;
                        return (
                          <button
                            key={at.value}
                            type="button"
                            onClick={() => setAccountType(at.value)}
                            className={`relative rounded-lg border p-4 text-left transition-colors flex flex-col gap-2 bg-white cursor-pointer ${
                              selected
                                ? "border-ink ring-1 ring-ink"
                                : "border-border hover:border-border-strong"
                            }`}
                            aria-pressed={selected}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-ink text-white" : "bg-surface-1 text-foreground-strong"}`}
                              >
                                <Icon className="h-5 w-5" />
                              </span>
                              <div>
                                <p className="text-sm font-bold text-foreground-strong">
                                  {at.label}
                                </p>
                                <p className="text-xs text-foreground-muted">{at.desc}</p>
                              </div>
                            </div>
                            <span
                              className={`mt-1 ml-auto flex size-5 shrink-0 items-center justify-center rounded-full border ${
                                selected ? "border-ink bg-ink" : "border-border"
                              }`}
                            >
                              {selected && (
                                <svg
                                  className="h-3 w-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-sm font-semibold text-foreground-strong"
                    >
                      Full name <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="name"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Adebayo Ogunleye"
                        className="w-full h-10 pl-3 pr-9 rounded-sm border bg-white text-sm max-sm:text-base text-foreground placeholder:text-muted-foreground-2 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-2 disabled:text-muted-foreground border-border hover:border-border-strong focus:ring-[3px] focus:ring-focus-ring"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                        <User className="h-4 w-4" />
                      </span>
                    </div>
                  </div>

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
                    <p className="mt-1.5 text-xs text-muted-foreground">At least 8 characters.</p>
                  </div>

                  <div>
                    <label
                      htmlFor="password_confirmation"
                      className="mb-1.5 block text-sm font-semibold text-foreground-strong"
                    >
                      Confirm password <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="password_confirmation"
                        type={showConfirm ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder=""
                        className="w-full h-10 pl-3 pr-10 rounded-sm border bg-white text-sm max-sm:text-base text-foreground placeholder:text-muted-foreground-2 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-2 disabled:text-muted-foreground border-border hover:border-border-strong focus:ring-[3px] focus:ring-focus-ring"
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
                    <p className="mt-1.5 text-xs text-muted-foreground">Passwords must match.</p>
                  </div>

                  {/* Privacy Policy consent — mandatory (Uganda DPPA 2019, Article 9) */}
                  <div className="flex items-start gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPrivacyAgreed(!privacyAgreed)}
                      aria-label={
                        privacyAgreed ? "Uncheck privacy agreement" : "Check privacy agreement"
                      }
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-colors"
                      style={{
                        borderColor: privacyAgreed ? "#dc2626" : "#d1d5db",
                        backgroundColor: privacyAgreed ? "#dc2626" : "white",
                      }}
                    >
                      {privacyAgreed && <CheckSquare className="h-3.5 w-3.5 text-white" />}
                    </button>
                    <label className="text-xs text-foreground-muted">
                      I confirm that I have read and agree to the{" "}
                      <Link
                        to="/privacy-policy"
                        className="font-semibold text-primary hover:underline"
                      >
                        Privacy Policy
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/terms-and-conditions"
                        className="font-semibold text-primary hover:underline"
                      >
                        Terms and Conditions
                      </Link>
                      . This includes consent to process my personal data under the Uganda Data
                      Protection and Privacy Act, 2019. <span className="text-destructive">*</span>
                    </label>
                  </div>

                  {/* Marketing consent — optional (Article 9(3)) */}
                  <div className="flex items-start gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setMarketingConsent(!marketingConsent)}
                      aria-label={
                        marketingConsent ? "Uncheck marketing consent" : "Check marketing consent"
                      }
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-colors"
                      style={{
                        borderColor: marketingConsent ? "#dc2626" : "#d1d5db",
                        backgroundColor: marketingConsent ? "#dc2626" : "white",
                      }}
                    >
                      {marketingConsent && <CheckSquare className="h-3.5 w-3.5 text-white" />}
                    </button>
                    <label className="text-xs text-foreground-muted">
                      <span className="font-semibold">Send me marketing updates</span> — receive
                      property alerts, promotions, and newsletters. You can unsubscribe at any time
                      via your account settings.
                    </label>
                  </div>

                  {error && (
                    <p className="rounded-md bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                      {error}
                    </p>
                  )}

                  <div className="my-4 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span className="h-px flex-1 bg-border" /> or sign up with{" "}
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <button
                    type="button"
                    className="appearance-none inline-flex items-center justify-center font-semibold whitespace-nowrap rounded-pill cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:cursor-not-allowed bg-white text-foreground-strong border border-border hover:bg-surface-1 h-12 px-6 text-base gap-2 w-full"
                  >
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
                  </button>

                  <p className="text-xs text-foreground-muted">
                    By registering you accept our{" "}
                    <Link
                      to="/terms-and-conditions"
                      className="text-primary font-semibold hover:underline"
                    >
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy-policy"
                      className="text-primary font-semibold hover:underline"
                    >
                      Privacy Policy
                    </Link>{" "}
                    and agree that we may contact you with relevant offers and services.
                  </p>
                </div>
              </div>

              <div className="hidden lg:block">
                <hr className="my-6 border-border" />
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-foreground-muted">
                    Already have an account?{" "}
                    <Link to="/signin" className="font-semibold text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFullName("");
                        setEmail("");
                        setPassword("");
                        setConfirmPassword("");
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
                      {busy ? "Creating account..." : "Register now"}{" "}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:hidden">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFullName("");
                      setEmail("");
                      setPassword("");
                      setConfirmPassword("");
                      setError(null);
                    }}
                    className="btn-base btn-outline h-10 px-5 flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="btn-base btn-primary hover:btn-primary-hover h-10 px-5 text-sm gap-2 flex-1 rounded-pill disabled:opacity-60"
                  >
                    {busy ? "Creating..." : "Register now"}
                  </button>
                </div>
                <p className="mt-4 text-center text-sm text-foreground-muted">
                  Already have an account?{" "}
                  <Link to="/signin" className="font-semibold text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>

            <div className="hidden flex-col gap-6 lg:flex">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-[0.9375rem] font-bold tracking-[-0.01em] text-foreground-strong">
                  Why register
                </h3>
                <ul className="mt-4 space-y-4">
                  <li className="flex items-center gap-3 text-sm text-foreground-muted">
                    <Heart className="h-5 w-5 text-primary" /> Save listings
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground-muted">
                    <Bell className="h-5 w-5 text-primary" /> Get matching alerts
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground-muted">
                    <MessageCircle className="h-5 w-5 text-primary" /> Message agents
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground-muted">
                    <PlusSquare className="h-5 w-5 text-primary" /> Post your own
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-[0.9375rem] font-bold tracking-[-0.01em] text-foreground-strong">
                  Across Uganda
                </h3>
                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  <div>
                    <p className="text-lg font-bold text-foreground-strong">950+</p>
                    <p className="text-[0.6875rem] text-muted-foreground">Listings</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground-strong">50+</p>
                    <p className="text-[0.6875rem] text-muted-foreground">Agents</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground-strong">31+</p>
                    <p className="text-[0.6875rem] text-muted-foreground">Areas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-extrabold text-foreground-strong sm:text-xl">
              We&apos;re here to help
            </h2>
            <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-2">
              <Link
                to="/contact"
                className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-surface-1"
              >
                <Mail className="h-5 w-5 text-primary" />
                <h3 className="mt-3 text-sm font-bold text-foreground-strong">Email support</h3>
                <p className="mt-1 text-xs text-foreground-muted">
                  Our team typically replies within a few hours.
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <h3 className="mt-3 text-sm font-bold text-foreground-strong">Registration FAQs</h3>
                <p className="mt-1 text-xs text-foreground-muted">
                  Common questions about creating an account.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
}
