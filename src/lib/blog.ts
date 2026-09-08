export type BlogCategory =
  | "work-updates"
  | "property-guides"
  | "development"
  | "legal"
  | "market-news";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  image: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  published: boolean;
};

export const BLOG_CATEGORIES: { id: BlogCategory; label: string }[] = [
  { id: "work-updates", label: "Work & Project Updates" },
  { id: "property-guides", label: "Property Guides" },
  { id: "development", label: "Construction & Development" },
  { id: "legal", label: "Legal & Land Titles" },
  { id: "market-news", label: "Market News" },
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-001",
    title: "Project Milestone: Sseguku Katale Executive Flat House Inspection & Handover",
    slug: "sseguku-katale-executive-flat-house-inspection",
    excerpt:
      "AMDERN Properties completed site inspection and utility verification for the premium 6-bedroom executive flat house along Entebbe Road.",
    content: `We are proud to announce the completion of comprehensive site verification and infrastructure inspection on our flagship Sseguku Katale property along Entebbe Road.\n\n### Project Highlights & Structural Quality\nThe property sits on 25 decimals (100x100ft) of Mailo titled land with clear boundary demarcations verified directly with the Ministry of Lands Zonal Office.\n\n- **Electrical & Plumbing**: High-grade industrial conduit wiring, three-phase power connection, and 10,000L auxiliary NWSC gravity tank system installed.\n- **Finishes**: Italian porcelain tiling, modern gypsum board ceilings with LED ambient lighting, and bespoke hardwood kitchen cabinetry.\n- **Access Road**: Direct private paved driveway connecting to the main tarmac within 300 meters.\n\nOur team is hosting scheduled client inspections every Tuesday and Saturday. Contact our headquarters on +256 702 104 499 to book your exclusive walkthrough.`,
    category: "work-updates",
    image: "/property-media/IMG-20260825-WA0018.jpg",
    author: "Denis Mugisha",
    authorRole: "Managing Director, AMDERN Properties",
    publishedAt: "2026-08-30",
    readTime: "4 min read",
    tags: ["Site Update", "Sseguku", "Entebbe Road", "Executive Homes"],
    published: true,
  },
  {
    id: "blog-002",
    title: "How to Verify Land Titles in Uganda Before Making Down Payments",
    slug: "how-to-verify-land-titles-in-uganda",
    excerpt:
      "A step-by-step practical guide to performing official Ministry of Lands searches, identifying genuine Mailo/Freehold titles, and avoiding common real estate pitfalls.",
    content: `Buying land in Uganda is one of the most rewarding investments, but conducting rigorous due diligence is non-negotiable.\n\n### 1. The Official Land Registry Search\nNever rely on a photocopy of a title. Always request the duplicate certificate of title and commission an official search report at the relevant Ministry of Lands, Housing and Urban Development (MLHUD) zonal office (e.g., Wakiso, Kampala, Mukono).\n\n### 2. Physical Site Verification with Neighbors & LC1\nConfirm actual physical ground boundaries with a licensed registered surveyor. Meet the local LC1 leadership and adjoining land owners to confirm that no boundary disputes, customary tenant claims (Kibanja), or family encumbrances exist.\n\n### 3. Verification of Seller Identity\nCross-check the seller's National Identification Card (NIN) against the name registered on the title deed. If the land belongs to an estate, ensure valid Letters of Administration have been confirmed by the High Court.`,
    category: "legal",
    image: "/property-media/kira-mulawa-01.jpg",
    author: "Counsel Brenda Kyomugisha",
    authorRole: "Legal Advisor, AMDERN Properties",
    publishedAt: "2026-08-25",
    readTime: "6 min read",
    tags: ["Land Titles", "Legal Due Diligence", "Uganda Real Estate"],
    published: true,
  },
  {
    id: "blog-003",
    title: "Construction Update: 12-Unit Apartment Block in Kyaliwajjala Reaches 100% Occupancy",
    slug: "kyaliwajjala-apartment-block-occupancy-update",
    excerpt:
      "Investor report on the 12-unit residential apartment complex in Kyaliwajjala achieving full occupancy with monthly rental yield exceeding UGX 12.8M.",
    content: `AMDERN Properties SMC LTD is thrilled to present the performance audit for the newly completed multi-unit apartment complex in Kyaliwajjala, Wakiso District.\n\n### Rental Collection & Yield Performance\n- **Total Units**: 12 units (8 units at UGX 1,200,000/month, 4 units at UGX 1,000,000/month)\n- **Monthly Revenue**: UGX 12,800,000\n- **Annual Gross Collection**: UGX 153,600,000\n- **Compound Security**: 24/7 security guard post, CCTV surveillance, automated gate, and individual pre-paid Yaka electricity meters.\n\nThis project demonstrates the strong, resilient demand for well-located 2-bedroom rental apartments in the Kira-Kyaliwajjala urban growth corridor.`,
    category: "development",
    image: "/property-media/kyaliwajjala-01.jpg",
    author: "Denis Mugisha",
    authorRole: "Managing Director, AMDERN Properties",
    publishedAt: "2026-08-20",
    readTime: "3 min read",
    tags: ["Multi-Unit", "Rental Yield", "Kyaliwajjala", "Investment"],
    published: true,
  },
  {
    id: "blog-004",
    title: "Greater Kampala Real Estate Trends: Top Emerging Growth Corridors for 2026",
    slug: "greater-kampala-real-estate-trends-2026",
    excerpt:
      "Analysis of property appreciation rates in Matugga, Kira-Mulawa, Namugongo-Nabusugwe, and Entebbe Expressway feeder zones.",
    content: `As infrastructure expansion accelerates across the Greater Kampala Metropolitan Area, property values along newly paved connector roads have witnessed significant capital gains.\n\n### Key Growth Corridors:\n1. **Kira - Mulawa & Kasangati Corridor**: Benefiting from rapid commercialization, newly opened shopping centers, and top-tier private schools.\n2. **Matugga - Kiryagonja & Sanga Area**: Providing affordable entry points for first-time home buyers with genuine titled plots priced from UGX 60M to 120M.\n3. **Namugongo - Nabusugwe**: Experiencing high demand for luxury family bungalows and gated communities due to peaceful suburban atmosphere and quick connection to Northern Bypass.\n\nAMDERN Properties maintains active listings across all these prime zones with verified titles and direct developer terms.`,
    category: "market-news",
    image: "/property-media/IMG-20260824-WA0089.jpg",
    author: "Sarah Nakato",
    authorRole: "Market Research Lead",
    publishedAt: "2026-08-15",
    readTime: "5 min read",
    tags: ["Market Trends", "Kampala", "Property Appreciation"],
    published: true,
  },
];

const BLOG_STORAGE_KEY = "amdern_blog_posts";

export function getStoredBlogPosts(): BlogPost[] {
  if (typeof window === "undefined") return INITIAL_BLOG_POSTS;
  try {
    const raw = localStorage.getItem(BLOG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(INITIAL_BLOG_POSTS));
      return INITIAL_BLOG_POSTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BLOG_POSTS;
  } catch {
    return INITIAL_BLOG_POSTS;
  }
}

export function saveBlogPostLocal(post: BlogPost): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredBlogPosts();
    const index = current.findIndex((p) => p.id === post.id);
    let updated: BlogPost[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = post;
    } else {
      updated = [post, ...current];
    }
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save blog post:", e);
  }
}

export function deleteBlogPostLocal(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredBlogPosts();
    const updated = current.filter((p) => p.id !== id);
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete blog post:", e);
  }
}
