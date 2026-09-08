import type { Listing, Filters } from "@/lib/listings";
import { LISTINGS, filterListings, AGENTS, agentById } from "@/lib/listings";
import { REGIONS } from "@/lib/site";

// Local storage keys
const STORAGE_LISTINGS_KEY = "amdern_custom_listings";
const STORAGE_ENQUIRIES_KEY = "amdern_enquiries";

function getStoredListings(): Listing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_LISTINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getAllListings(): Listing[] {
  const custom = getStoredListings();
  if (custom.length === 0) return LISTINGS;
  // Merge custom listings at the front
  return [...custom, ...LISTINGS.filter((l) => !custom.some((c) => c.id === l.id))];
}

export function saveListingLocal(listing: Listing): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredListings();
    const updated = [listing, ...current.filter((l) => l.id !== listing.id)];
    localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save listing locally:", e);
  }
}

export function deleteListingLocal(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredListings();
    const updated = current.filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete listing locally:", e);
  }
}

export async function getListings(filters?: Filters): Promise<Listing[]> {
  const all = getAllListings();
  if (!filters) return all;
  return filterListings(filters, all);
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const all = getAllListings();
  const clean = slug.toLowerCase().trim();
  return (
    all.find(
      (l) =>
        l.slug?.toLowerCase() === clean ||
        l.id?.toLowerCase() === clean ||
        l.ref?.toLowerCase() === clean,
    ) ?? null
  );
}

export async function getListingById(id: string): Promise<Listing | null> {
  const all = getAllListings();
  const clean = id.toLowerCase().trim();
  return (
    all.find(
      (l) =>
        l.id?.toLowerCase() === clean ||
        l.slug?.toLowerCase() === clean ||
        l.ref?.toLowerCase() === clean,
    ) ?? null
  );
}

export async function getAgents() {
  return AGENTS.map((a) => ({
    id: a.id,
    name: a.name,
    kind: a.kind,
    phone: a.phone,
    phone2: a.phone2,
    email: a.email,
    about: a.about,
    listings: a.listings,
    area: a.area,
    area_id: "",
    profile_id: a.id,
    created_at: new Date().toISOString(),
  }));
}

export async function getAgentById(id: string) {
  const found = agentById(id);
  if (!found) return null;
  return {
    id: found.id,
    name: found.name,
    kind: found.kind,
    phone: found.phone,
    phone2: found.phone2,
    email: found.email,
    about: found.about,
    listings: found.listings,
    area: found.area,
    area_id: "",
    profile_id: found.id,
    created_at: new Date().toISOString(),
  };
}

export async function getRegions() {
  return REGIONS.map((r, i) => ({
    id: `reg-${i + 1}`,
    name: r.name,
    slug: r.slug,
    count: r.count,
    districts: r.districts,
  }));
}

export async function getAreas() {
  const areas: { id: string; name: string; region: string }[] = [];
  let count = 0;
  for (const r of REGIONS) {
    for (const d of r.districts) {
      count++;
      areas.push({ id: `area-${count}`, name: d, region: r.name });
    }
  }
  return areas;
}

export async function getListingsCount(): Promise<number> {
  return getAllListings().length;
}

export async function getAgentsCount(): Promise<number> {
  return AGENTS.length + 50; // Reflect 51+ active network agents
}

export async function getAreasCount(): Promise<number> {
  return REGIONS.reduce<number>((acc, r) => acc + (r.districts?.length || 0), 0);
}

export async function getDashboardMetrics() {
  const count = await getListingsCount();
  const storedEnquiries = getStoredEnquiries();
  const totalLeads = storedEnquiries.length > 0 ? storedEnquiries.length : 14;

  return {
    activeProperties: count,
    totalLeads,
    totalViews: count * 52,
    remainingCredits: Math.max(0, 100 - count),
  };
}

export type EnquiryRecord = {
  id: string;
  listing: string;
  listingTitle: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  channel: string;
  status: string;
  message: string;
};

const DEFAULT_ENQUIRIES: EnquiryRecord[] = [
  {
    id: "enq-001",
    listing: "FLT-001",
    listingTitle: "FLAT HOUSE FOR SALE - SSEGUKU KATALE, ENTEBBE ROAD",
    name: "Mukasa David",
    email: "mukasa.david@gmail.com",
    phone: "+256 772 345 678",
    date: "2026-08-30",
    channel: "email",
    status: "new",
    message: "Interested in scheduling a site visit this weekend.",
  },
  {
    id: "enq-002",
    listing: "HSE-001",
    listingTitle: "HOUSE ON QUICK SALE 75M IN MATUGGA KIRYAGONJA",
    name: "Sarah Namubiru",
    email: "sarah.namubiru@yahoo.com",
    phone: "+256 701 987 654",
    date: "2026-08-28",
    channel: "whatsapp",
    status: "replied",
    message: "Please send more photos of the title agreement and parking space.",
  },
  {
    id: "enq-003",
    listing: "FLT-003",
    listingTitle: "12 Unit Apartment Block in Kyaliwajjala",
    name: "Dr. Ronald Kigozi",
    email: "rkigozi@invest.ug",
    phone: "+256 782 112 233",
    date: "2026-08-26",
    channel: "phone",
    status: "in_progress",
    message: "Inquiring about monthly rental revenue audit report.",
  },
];

function getStoredEnquiries(): EnquiryRecord[] {
  if (typeof window === "undefined") return DEFAULT_ENQUIRIES;
  try {
    const raw = localStorage.getItem(STORAGE_ENQUIRIES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_ENQUIRIES_KEY, JSON.stringify(DEFAULT_ENQUIRIES));
      return DEFAULT_ENQUIRIES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ENQUIRIES;
  }
}

export function saveEnquiryLocal(enquiry: Omit<EnquiryRecord, "id" | "date" | "status" | "channel">): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredEnquiries();
    const newEnq: EnquiryRecord = {
      ...enquiry,
      id: `enq-${Date.now()}`,
      date: new Date().toISOString().split("T")[0]!,
      channel: "email",
      status: "new",
    };
    localStorage.setItem(STORAGE_ENQUIRIES_KEY, JSON.stringify([newEnq, ...current]));
  } catch (e) {
    console.error("Failed to save enquiry locally:", e);
  }
}

export async function getRecentEnquiries(limit = 5): Promise<EnquiryRecord[]> {
  const enquiries = getStoredEnquiries();
  return enquiries.slice(0, limit);
}

export async function getMyListings(_userId?: string): Promise<Listing[]> {
  return getAllListings();
}

export async function getMyEnquiries(_userId?: string): Promise<EnquiryRecord[]> {
  return getStoredEnquiries();
}
