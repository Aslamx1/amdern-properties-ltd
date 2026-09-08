import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { REGIONS, SITE } from "@/lib/site";

const popular = REGIONS.flatMap((r) => [
  {
    label: `Houses for rent in ${r.name}`,
    search: { listing: "rent", category: "houses", location: r.name },
  },
  {
    label: `Flats for rent in ${r.name}`,
    search: { listing: "rent", category: "flats", location: r.name },
  },
  {
    label: `Houses for sale in ${r.name}`,
    search: { listing: "sale", category: "houses", location: r.name },
  },
]);

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M14.5 3c.7 2.3 2.4 3.7 4.7 4.1v2.8c-1.4.1-2.8-.4-4.1-1.5v6.6c0 3.1-2.5 5.6-5.6 5.6s-5.6-2.5-5.6-5.6 2.5-5.6 5.6-5.6c.3 0 .6 0 .9.1v2.8c-.3-.1-.6-.1-.9-.1-1.5 0-2.8 1.3-2.8 2.8s1.3 2.8 2.8 2.8 2.8-1.3 2.8-2.8V3h2.2Z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.9 4.7 12 4.7 12 4.7s-5.9 0-7.6.5a2.8 2.8 0 0 0-2 2A29.8 29.8 0 0 0 2 12a29.8 29.8 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.7.5 7.6.5 7.6.5s5.9 0 7.6-.5a2.8 2.8 0 0 0 2-2A29.8 29.8 0 0 0 22 12a29.8 29.8 0 0 0-.4-4.8ZM10 15.5v-7l6.2 3.5L10 15.5Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.3c0-.9.3-1.6 1.7-1.6H17V2.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H8v3.2h2.3v8h3.2Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M18.9 2h3.4l-7.5 8.6L22.7 22h-6.8l-5.3-7.6L4.6 22H1.2l8-9.2L1 2h7l4.8 6.8L18.9 2Zm-1.2 18.1h1.9L7.1 3.8H5.1l12.6 16.3Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2Zm0 2A2.8 2.8 0 1 0 14.8 12 2.8 2.8 0 0 0 12 9.2Zm5.1-3.2a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2Z" />
    </svg>
  );
}

const socialLinks = [
  { href: "https://www.tiktok.com/@amdernproperties", label: "TikTok", icon: TikTokIcon, className: "bg-[#000000] text-white" },
  { href: "https://www.youtube.com/@amdernproperties", label: "YouTube", icon: YouTubeIcon, className: "bg-[#FF0000] text-white" },
  { href: "https://www.facebook.com/amdernproperties", label: "Facebook", icon: FacebookIcon, className: "bg-[#1877F2] text-white" },
  { href: "https://x.com/AmdernProperties", label: "X", icon: XIcon, className: "bg-[#000000] text-white" },
  { href: "https://www.instagram.com/amdernproperties", label: "Instagram", icon: InstagramIcon, className: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white" },
];

export function Footer() {
  return (
    <footer className="mt-16 bg-ink text-ink-muted">
      <div className="container-page py-12">
        <div className="mb-10 grid gap-8 border-b border-white/10 pb-10 md:grid-cols-4">
          <div>
            <Logo variant="light" />
            <p className="mt-4 text-sm leading-relaxed">
              {SITE.name} is a leading property marketplace in Uganda, with listings for sale, rent
              and lease across the country.
            </p>
            <Link
              to="/about"
              className="mt-3 inline-block text-sm font-bold text-primary-foreground underline"
            >
              Learn more
            </Link>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold text-ink-foreground">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/agents" className="hover:text-ink-foreground">
                  Estate agents
                </Link>
              </li>
              <li>
                <Link to="/developers" className="hover:text-ink-foreground">
                  Property developers
                </Link>
              </li>
              <li>
                <Link to="/market-trends/demand" className="hover:text-ink-foreground">
                  Property demand trends
                </Link>
              </li>
              <li>
                <Link to="/market-trends/prices" className="hover:text-ink-foreground">
                  Average property prices
                </Link>
              </li>
              <li>
                <Link to="/market-trends/reports" className="hover:text-ink-foreground">
                  Quarterly market reports
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-ink-foreground">
                  Property blog
                </Link>
              </li>
              <li>
                <Link to="/area-guides" className="hover:text-ink-foreground">
                  Area guides
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold text-ink-foreground">Advertise</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/list-property" className="hover:text-ink-foreground">
                  Advertise your property
                </Link>
              </li>
              <li>
                <Link to="/advertise/listing-types" className="hover:text-ink-foreground">
                  Types of listings
                </Link>
              </li>
              <li>
                <Link to="/advertise/premium-plus" className="hover:text-ink-foreground">
                  Premium Plus
                </Link>
              </li>
              <li>
                <Link to="/advertise/verified-photos" className="hover:text-ink-foreground">
                  Verified Photos
                </Link>
              </li>
              <li>
                <Link to="/advertise/banners" className="hover:text-ink-foreground">
                  Place banner adverts
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold text-ink-foreground">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="hover:text-ink-foreground">
                  Help centre
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-ink-foreground">
                  Contact us
                </Link>
              </li>
            </ul>
            <h3 className="mb-3 mt-6 text-sm font-bold text-ink-foreground">Get in touch</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                  className="hover:text-ink-foreground transition-colors"
                >
                  {SITE.phone}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE.phone2.replace(/\s/g, "")}`}
                  className="hover:text-ink-foreground transition-colors"
                >
                  {SITE.phone2}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="hover:text-ink-foreground transition-colors"
                >
                  {SITE.email}
                </a>
              </li>
              <li className="leading-relaxed">{SITE.address}</li>
            </ul>
          </div>
        </div>

        <div className="mb-10 flex flex-col gap-3 border-b border-white/10 pb-8">
          <h3 className="text-sm font-bold text-ink-foreground">Follow us</h3>
          <div className="flex flex-wrap items-center gap-3">
            {socialLinks.map(({ href, label, icon: Icon, className }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 hover:scale-105 ${className}`}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <h3 className="mb-3 text-sm font-bold text-ink-foreground">Popular property</h3>
        <ul className="mb-10 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((p) => (
            <li key={p.label}>
              <Link to="/search" search={p.search as never} className="hover:text-ink-foreground">
                {p.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-xs">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <Link to="/privacy" className="hover:text-ink-foreground">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-ink-foreground">
            Terms of Use
          </Link>
          <Link to="/privacy" className="hover:text-ink-foreground">
            Cookie Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
