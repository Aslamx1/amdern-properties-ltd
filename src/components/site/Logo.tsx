import { Link } from "@tanstack/react-router";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const src = variant === "light" ? "/adn-logo-white.svg" : "/adn-logo.png";
  const alt = "Amdern Properties SMC Limited";
  const textColor = variant === "light" ? "text-ink-foreground" : "text-foreground-strong";
  const subColor = variant === "light" ? "text-ink-muted" : "text-muted-foreground";

  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Amdern Properties home">
      <img
        src={src}
        alt={alt}
        className="h-8 w-auto object-contain rounded-md"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/adn-logo.svg";
        }}
      />
      <span className="leading-tight hidden sm:block">
        <span className={`block text-sm font-extrabold tracking-tight ${textColor}`}>
          Amdern Properties
        </span>
        <span className={`block text-[10px] font-semibold uppercase tracking-[0.14em] ${subColor}`}>
          SMC LIMITED
        </span>
      </span>
    </Link>
  );
}
