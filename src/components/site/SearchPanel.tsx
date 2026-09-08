import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { PROPERTY_TYPE_GROUPS } from "@/lib/site";

const TABS = [
  { key: "sale", label: "Buy" },
  { key: "rent", label: "Rent" },
  { key: "shortlet", label: "Shortlet" },
  { key: "jv", label: "Joint Venture" },
];

const PRICES = [
  0, 10_000, 50_000, 100_000, 500_000, 1_000_000, 5_000_000, 10_000_000, 50_000_000, 100_000_000,
  150_000_000, 400_000_000, 800_000_000, 1_500_000_000,
];

const fmt = (v: number) =>
  v === 0
    ? "No limit"
    : v >= 1_000_000_000
      ? `USh ${v / 1_000_000_000}B`
      : v >= 1_000_000
        ? `USh ${v / 1_000_000}M`
        : `USh ${v.toLocaleString("en-US")}`;

export function SearchPanel({
  initial = {},
  compact = false,
}: {
  initial?: {
    listing?: string | undefined;
    location?: string | undefined;
    type?: string | undefined;
    min?: number | undefined;
    max?: number | undefined;
    beds?: number | undefined;
    furnishing?: string | undefined;
    q?: string | undefined;
  };
  compact?: boolean;
}) {
  const navigate = useNavigate();
  const [listing, setListing] = useState(initial.listing ?? "sale");
  const [location, setLocation] = useState(initial.location ?? "");
  const [type, setType] = useState(initial.type ?? "");
  const [min, setMin] = useState(initial.min ?? 0);
  const [max, setMax] = useState(initial.max ?? 0);
  const [beds, setBeds] = useState(initial.beds ?? 0);
  const [more, setMore] = useState(false);
  const [furnishing, setFurnishing] = useState("");
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({
      to: "/search",
      search: {
        listing,
        ...(location ? { location } : {}),
        ...(type ? { type } : {}),
        ...(min ? { min } : {}),
        ...(max ? { max } : {}),
        ...(beds ? { beds } : {}),
        ...(furnishing ? { furnishing } : {}),
        ...(q ? { q } : {}),
      } as never,
    });
  }

  return (
    <form onSubmit={submit} className={compact ? "" : "surface-card p-3 shadow-pop sm:p-4"}>
      <div className="mb-3 flex flex-wrap gap-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setListing(t.key)}
            className={`rounded-md px-3 py-2 text-xs font-bold transition-colors sm:px-3.5 sm:py-2 sm:text-sm ${
              listing === t.key
                ? "bg-ink text-ink-foreground"
                : "bg-secondary text-foreground-strong hover:bg-border"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-2 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto]">
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Location
          </span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="region, district or town"
            className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm font-bold text-foreground-strong placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Property type
          </span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm font-bold text-foreground-strong focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Any type</option>
            {PROPERTY_TYPE_GROUPS.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <div>
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Price range
          </span>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={min}
              onChange={(e) => setMin(Number(e.target.value))}
              aria-label="Min price"
              className="w-full rounded-md border border-input bg-background px-2 py-2.5 text-sm font-bold text-foreground-strong"
            >
              {PRICES.map((p) => (
                <option key={p} value={p}>
                  {p === 0 ? "No min" : fmt(p)}
                </option>
              ))}
            </select>
            <select
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              aria-label="Max price"
              className="w-full rounded-md border border-input bg-background px-2 py-2.5 text-sm font-bold text-foreground-strong"
            >
              {PRICES.map((p) => (
                <option key={p} value={p}>
                  {p === 0 ? "No max" : fmt(p)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Bedrooms
          </span>
          <select
            value={beds}
            onChange={(e) => setBeds(Number(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm font-bold text-foreground-strong"
          >
            <option value={0}>Any</option>
            {[1, 2, 3, 4, 5, 6].map((b) => (
              <option key={b} value={b}>
                {b}+ beds
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="btn-base btn-primary hover:btn-primary-hover h-[42px] w-full lg:w-auto"
          >
            <Search className="h-4 w-4" /> Search
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setMore(!more)}
        className="mt-3 flex items-center gap-1.5 text-xs font-bold text-primary"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        More search options
      </button>

      {more && (
        <div className="mt-3 grid gap-2 border-t border-border pt-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Furnishing
            </span>
            <select
              value={furnishing}
              onChange={(e) => setFurnishing(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm font-bold text-foreground-strong"
            >
              <option value="">Any</option>
              <option value="furnished">Furnished</option>
              <option value="serviced">Serviced</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Keywords or property ref.
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. pool, AMD1004"
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm font-bold text-foreground-strong placeholder:font-normal"
            />
          </label>
        </div>
      )}
    </form>
  );
}
