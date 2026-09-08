import { ALL_UPC_IMAGES } from "./verified-upc-images";
import { REGIONS } from "./site";

export const USE_SUPABASE = false;

export function getUpcImage(id: string, index = 0): string {
  if (!ALL_UPC_IMAGES || ALL_UPC_IMAGES.length === 0) return "/placeholder.png";
  const seed = Math.abs(
    id.split("").reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0),
  );
  const poolIndex = (seed * 7 + index) % ALL_UPC_IMAGES.length;
  return ALL_UPC_IMAGES[poolIndex] || ALL_UPC_IMAGES[0] || "/placeholder.png";
}

export function getUpcImages(id: string, count: number = 5): string[] {
  if (!ALL_UPC_IMAGES || ALL_UPC_IMAGES.length === 0) return ["/placeholder.png"];
  const seed = Math.abs(
    id.split("").reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0),
  );
  const poolSize = Math.min(count, ALL_UPC_IMAGES.length);
  const poolStart = (seed * 7) % ALL_UPC_IMAGES.length;
  const result: string[] = [];
  for (let i = 0; i < poolSize; i++) {
    result.push(ALL_UPC_IMAGES[(poolStart + i) % ALL_UPC_IMAGES.length]);
  }
  return result;
}

export type Listing = {
  id: string;
  ref: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  title: string;
  type: string;
  category: "houses" | "flats" | "land" | "commercial" | "shortlets" | "offices";
  listing: "sale" | "rent" | "shortlet" | "jv";
  price: number;
  period?: "month" | "year" | "night" | undefined;
  area: string;
  district: string;
  region: string;
  beds: number;
  baths: number;
  toilets: number;
  parking?: number;
  sizeSqm: number;
  plotSize?: string;
  serviced: boolean;
  furnished: boolean;
  shared: boolean;
  addedDaysAgo: number;
  images: string[];
  video?: string;
  photoCount?: number;
  description: string;
  features: string[];
  agentId: string;
  badge?: string | undefined;
  currency?: "UGX" | "USD";
  status?: string;
  viewCount?: number;
  moderationStatus?: string;
};

export function generatePropertySlug(l: {
  beds?: number;
  type?: string;
  listing?: string;
  district?: string;
  area?: string;
  ref?: string;
  id?: string;
}): string {
  const bedsPart = l.beds && l.beds > 0 ? `${l.beds}-bedroom-` : "";
  const typePart = (l.type || "property")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const listingPart = (l.listing || "sale").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const locRaw = (l.area || l.district || "uganda")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = (l.ref || l.id || "prop")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

  return `${bedsPart}${typePart}-for-${listingPart}-in-${locRaw}-${suffix}`.replace(/-+/g, "-");
}

export function generatePropertySchema(l: Listing, canonicalUrl?: string) {
  const url = canonicalUrl || `https://amdernpropertiessmclimited.com/property/${l.slug || l.id}`;
  const images = l.images && l.images.length > 0 ? l.images : ["https://amdernpropertiessmclimited.com/placeholder.png"];

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: l.metaTitle || l.title,
    description: l.metaDescription || l.description,
    url,
    image: images,
    offers: {
      "@type": "Offer",
      price: l.price,
      priceCurrency: l.currency || "UGX",
      availability: l.status === "active" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      businessFunction: l.listing === "rent" ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell",
    },
    mainEntity: {
      "@type": l.category === "flats" ? "Apartment" : "SingleFamilyResidence",
      name: l.title,
      numberOfBedrooms: l.beds,
      numberOfBathroomsTotal: l.baths,
      floorSize: {
        "@type": "QuantitativeValue",
        value: l.sizeSqm,
        unitCode: "MTK",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: l.area,
        addressRegion: l.district || l.region,
        addressCountry: "UG",
      },
    },
  };
}

const desc = (t: string, a: string) =>
  `This prime ${t.toLowerCase()} in ${a} is presented in immaculate condition. Situated within a secure, well-planned neighbourhood with quick access to main tarmac roads, top schools, modern shopping malls, and healthcare centres. The property has been built and finished to top standards with premium fittings throughout, excellent natural light, and spacious parking. Professional viewings can be scheduled directly with AMDERN PROPERTIES SMC LTD.`;

const F = [
  "24 hour security",
  "Borehole water & NWSC",
  "Standby generator",
  "Fitted modern kitchen",
  "Boys quarters / DSQ",
  "Paved tarmac access",
  "Perimeter wall with electric fence",
  "Ample secure parking",
  "Air conditioning",
  "Balcony with panoramic view",
  "Solar water heater system",
  "CCTV surveillance cameras",
];

type Seed = [
  string, // title
  string, // type
  Listing["category"],
  Listing["listing"],
  number, // price (UGX)
  string, // area
  string, // district
  string, // region
  number, // beds
  number, // baths
  number, // toilets
  number, // parking
  string, // plotSize
  string[], // images
];

const seeds: Seed[] = [
  // New listing: FLAT HOUSE FOR SALE - SSEGUKU KATALE, ENTEBBE ROAD
  [
    "FLAT HOUSE FOR SALE - SSEGUKU KATALE, ENTEBBE ROAD",
    "Executive Flat House",
    "flats",
    "sale",
    2100000000,
    "Sseguku Katale, Entebbe Road",
    "Entebbe",
    "Central Region",
    6,
    5,
    6,
    4,
    "25 Decimals (100x100ft)",
    [
      "/property-media/IMG-20260825-WA0018.jpg",
      "/property-media/IMG-20260825-WA0019.jpg",
      "/property-media/IMG-20260825-WA0020.jpg",
      "/property-media/IMG-20260825-WA0021.jpg",
      "/property-media/IMG-20260825-WA0022.jpg",
      "/property-media/IMG-20260825-WA0023.jpg",
      "/property-media/IMG-20260825-WA0024.jpg",
    ],
  ],

  // --- HOUSES FOR SALE ---
  [
    "HOUSE ON QUICK SALE 75M IN MATUGGA KIRYAGONJA",
    "House",
    "houses",
    "sale",
    75_000_000,
    "Matugga Kiryagonja",
    "Wakiso",
    "Central Region",
    3,
    1,
    1,
    1,
    "50ft by 50ft",
    [
      "/property-media/IMG-20260824-WA0089.jpg",
      "/property-media/IMG-20260824-WA0090.jpg",
      "/property-media/IMG-20260824-WA0091.jpg",
      "/property-media/IMG-20260824-WA0092.jpg",
      "/property-media/IMG-20260824-WA0093.jpg",
      "/property-media/IMG-20260824-WA0094.jpg",
      "/property-media/IMG-20260824-WA0095.jpg",
    ],
  ],
  [
    "Condominium 2 Bedroom Unit in Kira Butenga Estate",
    "Condominium",
    "flats",
    "sale",
    500_000_000,
    "Kira Butenga",
    "Wakiso",
    "Central Region",
    2,
    2,
    2,
    1,
    "Apartment unit",
    [
      "/property-media/1000429131_012.jpg",
      "/property-media/1000429131_053.jpg",
      "/property-media/1000429131_142.jpg",
      "/property-media/1000429131_152.jpg",
    ],
  ],
  [
    "5 Bedroom Luxury Mansion in Off Kira - Kasangati Road",
    "Mansion",
    "houses",
    "sale",
    700_000_000,
    "Off Kira - Kasangati Road",
    "Wakiso",
    "Central Region",
    5,
    5,
    6,
    5,
    "45 Decimals",
    ["/property-media/1000391394.jpg"],
  ],
  [
    "Brand New House for Sale in Seeta - Namiyango Road",
    "Modern Bungalow",
    "houses",
    "sale",
    400_000_000,
    "Seeta - Namiyango Road",
    "Wakiso",
    "Central Region",
    4,
    3,
    4,
    2,
    "20 Decimals",
    [
      "/property-media/IMG-20260808-WA0111.jpg",
      "/property-media/IMG-20260808-WA0111.jpg",
      "/property-media/IMG-20260808-WA0111.jpg",
    ],
  ],
  [
    "Fully-Furnished 6 Bedroom Flat Home for Sale - Namugongo Nabusugwe",
    "Flat Home",
    "flats",
    "sale",
    830_000_000,
    "Namugongo - Nabusugwe",
    "Wakiso",
    "Central Region",
    6,
    5,
    5,
    3,
    "15 Decimals",
    [
      "/property-media/IMG-20260825-WA0155.jpg",
      "/property-media/IMG-20260825-WA0156.jpg",
      "/property-media/IMG-20260825-WA0157.jpg",
      "/property-media/IMG-20260825-WA0158.jpg",
      "/property-media/IMG-20260825-WA0159.jpg",
    ],
  ],
  [
    "HOUSE ON QUICK SALE - Kiti Kansangati Mtuga Road",
    "House",
    "houses",
    "sale",
    75_000_000,
    "Kiti Kansangati Mtuga Road",
    "Soroti",
    "Eastern Region",
    2,
    1,
    1,
    2,
    "40ft by 100ft",
    [
      "/property-media/IMG-20260825-WA0027.jpg",
      "/property-media/IMG-20260825-WA0028.jpg",
      "/property-media/IMG-20260825-WA0029.jpg",
      "/property-media/IMG-20260825-WA0030.jpg",
      "/property-media/IMG-20260825-WA0031.jpg",
      "/property-media/IMG-20260825-WA0032.jpg",
      "/property-media/IMG-20260825-WA0033.jpg",
    ],
  ],
  [
    "6 Double Unit Rental Property in Namugongo Ssonde",
    "Residential Investment - Multi-Unit",
    "flats",
    "sale",
    480_000_000,
    "Namugongo Ssonde",
    "Wakiso",
    "Central Region",
    12,
    6,
    6,
    6,
    "14 Decimals",
    [
      "/property-media/IMG-20260824-WA0171.jpg",
      "/property-media/IMG-20260824-WA0173.jpg",
      "/property-media/IMG-20260824-WA0176.jpg",
      "/property-media/IMG-20260824-WA0177.jpg",
      "/property-media/IMG-20260824-WA0181.jpg",
      "/property-media/IMG-20260824-WA0183.jpg",
    ],
  ],
  [
    "12 Unit Apartment Block in Kyaliwajjala",
    "Block of Flats - Investment Property",
    "flats",
    "sale",
    1_700_000_000,
    "Kyaliwajjala",
    "Wakiso",
    "Central Region",
    24,
    12,
    12,
    8,
    "13 Decimals",
    [
      "/property-media/kyaliwajjala-01.jpg",
      "/property-media/kyaliwajjala-02.jpg",
      "/property-media/kyaliwajjala-03.jpg",
      "/property-media/kyaliwajjala-04.jpg",
      "/property-media/kyaliwajjala-05.jpg",
    ],
  ],
  [
    "Quick Sale! 5 Bedroom House in Bweyogere - 2in1 Property",
    "Detached House",
    "houses",
    "sale",
    480_000_000,
    "Bweyogere-Namanve",
    "Mukono",
    "Central Region",
    5,
    2,
    2,
    2,
    "24 Decimals",
    [
      "/property-media/bweyogere-01.jpg",
      "/property-media/bweyogere-02.jpg",
      "/property-media/bweyogere-03.jpg",
    ],
  ],

  // --- FLATS & APARTMENTS FOR SALE ---
  [
    "Apartment Block — Kyaliwajjala",
    "Block of Flats",
    "flats",
    "sale",
    1_700_000_000,
    "Kyaliwajjala",
    "Wakiso",
    "Central Region",
    12,
    12,
    12,
    8,
    "13 Decimals",
    [
      "/property-media/IMG-20260819-WA0109.jpg",
      "/property-media/IMG-20260819-WA0110.jpg",
      "/property-media/IMG-20260819-WA0111.jpg",
      "/property-media/IMG-20260819-WA0112.jpg",
      "/property-media/IMG-20260819-WA0114.jpg",
    ],
  ],
  [
    "House for Sale in Namugongo Jinja-Misindye",
    "Residential House",
    "houses",
    "sale",
    260_000_000,
    "Namugongo Jinja-Misindye",
    "Wakiso",
    "Central Region",
    3,
    3,
    1,
    2,
    "12 Decimals",
    [
      "/property-media/namugongo-01.jpg",
      "/property-media/namugongo-02.jpg",
      "/property-media/namugongo-03.jpg",
      "/property-media/namugongo-04.jpg",
      "/property-media/namugongo-05.jpg",
      "/property-media/namugongo-06.jpg",
    ],
  ],
  [
    "House for Sale at Bwebajja Entebbe Road",
    "Residential House",
    "houses",
    "sale",
    650_000_000,
    "Bwebajja",
    "Entebbe",
    "Central Region",
    3,
    1,
    1,
    1,
    "12 Decimals",
    [
      "/property-media/bwebajja-02.jpg",
      "/property-media/bwebajja-03.jpg",
      "/property-media/bwebajja-04.jpg",
      "/property-media/bwebajja-05.jpg",
      "/property-media/bwebajja-06.jpg",
      "/property-media/bwebajja-07.jpg",
      "/property-media/bwebajja-08.jpg",
      "/property-media/bwebajja-09.jpg",
      "/property-media/bwebajja-10.jpg",
      "/property-media/bwebajja-11.jpg",
      "/property-media/bwebajja-12.jpg",
    ],
  ],
  [
    "APARTMENT FOR SALE LOCATED IN KIWATULE — 10 UNITS",
    "Block of Flats",
    "flats",
    "sale",
    1_500_000_000,
    "Kiwatule",
    "Wakiso",
    "Central Region",
    10,
    10,
    10,
    5,
    "Titled land",
    [
      "/property-media/kiwatule-v8-01.jpg",
      "/property-media/kiwatule-v8-02.jpg",
      "/property-media/kiwatule-v8-03.jpg",
    ],
  ],
  [
    "BRAND NEW HOUSE FOR SALE IN KIRA - MULAWA AT 750M UGX",
    "House",
    "houses",
    "sale",
    750_000_000,
    "Kira - Mulawa",
    "Wakiso",
    "Central Region",
    5,
    5,
    5,
    2,
    "15 Decimals (Land Title)",
    [
      "/property-media/kira-mulawa-01.jpg",
      "/property-media/kira-mulawa-02.jpg",
      "/property-media/kira-mulawa-03.jpg",
      "/property-media/kira-mulawa-04.jpg",
      "/property-media/kira-mulawa-05.jpg",
      "/property-media/kira-mulawa-06.jpg",
      "/property-media/kira-mulawa-07.jpg",
      "/property-media/kira-mulawa-08.jpg",
      "/property-media/kira-mulawa-09.jpg",
      "/property-media/kira-mulawa-10.jpg",
    ],
  ],

  // --- LAND & PLOTS FOR SALE ---
  [
    "House for sale Akright Bwebajja",
    "House",
    "houses",
    "sale",
    3_187_500_000,
    "Akright Bwebajja",
    "Wakiso",
    "Central Region",
    6,
    6,
    6,
    2,
    "25 Decimals (Land Title)",
    [
      "/property-media/bwebajja-akright-01.jpg",
      "/property-media/bwebajja-akright-02.jpg",
      "/property-media/bwebajja-akright-03.jpg",
      "/property-media/bwebajja-akright-04.jpg",
      "/property-media/bwebajja-akright-05.jpg",
      "/property-media/bwebajja-akright-06.jpg",
      "/property-media/bwebajja-akright-07.jpg",
      "/property-media/bwebajja-akright-08.jpg",
    ],
  ],
  [
    "FLAT HOUSE FOR SALE BWEBAJJA ENTEBBE ROAD",
    "Flat House",
    "flats",
    "sale",
    1_725_000_000,
    "Bwebajja, Entebbe Road",
    "Wakiso",
    "Central Region",
    6,
    6,
    6,
    2,
    "25 Decimals (100x100ft)",
    [
      "/property-media/bwebajja-flat-01.jpg",
      "/property-media/bwebajja-flat-02.jpg",
      "/property-media/bwebajja-flat-03.jpg",
      "/property-media/bwebajja-flat-04.jpg",
      "/property-media/bwebajja-flat-05.jpg",
      "/property-media/bwebajja-flat-06.jpg",
    ],
  ],
  [
    "Quick Deal! Rentals on Sale in Namugongo - Misindye",
    "Rental Block",
    "flats",
    "sale",
    195_000_000,
    "Namugongo - Misindye",
    "Wakiso",
    "Central Region",
    10,
    10,
    10,
    2,
    "18 Decimals (Mailo Title)",
    [
      "/property-media/namugongo-misindye-01.jpg",
      "/property-media/namugongo-misindye-02.jpg",
      "/property-media/namugongo-misindye-03.jpg",
      "/property-media/namugongo-misindye-04.jpg",
      "/property-media/namugongo-misindye-05.jpg",
      "/property-media/namugongo-misindye-06.jpg",
      "/property-media/namugongo-misindye-07.jpg",
      "/property-media/namugongo-misindye-08.jpg",
    ],
  ],
  [
    "3 BEDROOM HOUSE FOR SALE IN NAMUGONGO (U-BRANCH OFF ANGLICAN CHURCH)",
    "House",
    "houses",
    "sale",
    115_000_000,
    "Namugongo (U-Branch off Anglican Church)",
    "Wakiso",
    "Central Region",
    3,
    2,
    2,
    2,
    "50ft by 80ft",
    [
      "/property-media/namugongo-house-01.jpg",
      "/property-media/namugongo-house-02.jpg",
      "/property-media/namugongo-house-03.jpg",
      "/property-media/namugongo-house-04.jpg",
      "/property-media/namugongo-house-05.jpg",
      "/property-media/namugongo-house-06.jpg",
      "/property-media/namugongo-house-07.jpg",
    ],
  ],
  [
    "HOUSE ON QUICK SALE - MATUGGA SANGA TOWN",
    "House",
    "houses",
    "sale",
    66_000_000,
    "Matugga Sanga",
    "Wakiso",
    "Central Region",
    2,
    1,
    1,
    1,
    "60ft by 70ft",
    [
      "/property-media/matugga-sanga-01.jpg",
      "/property-media/matugga-sanga-02.jpg",
      "/property-media/matugga-sanga-03.jpg",
      "/property-media/matugga-sanga-04.jpg",
      "/property-media/matugga-sanga-05.jpg",
      "/property-media/matugga-sanga-06.jpg",
      "/property-media/matugga-sanga-07.jpg",
      "/property-media/matugga-sanga-08.jpg",
    ],
  ],
  [
    "Prime Commercial Plot on Ntinda Main Road",
    "Commercial Land",
    "land",
    "sale",
    450_000_000,
    "Ntinda",
    "Kampala",
    "Central Region",
    0,
    0,
    0,
    0,
    "30 Decimals",
    getUpcImages("prop-ntinda-012", 5),
  ],
  [
    "25 Acres Agricultural Land with Fruit Plantation",
    "Agricultural Land / Farm",
    "land",
    "sale",
    350_000_000,
    "Kayunga",
    "Kayunga",
    "Central Region",
    0,
    0,
    0,
    0,
    "25 Acres",
    getUpcImages("prop-kayunga-013", 5),
  ],

  // --- COMMERCIAL FOR SALE ---
  [
    "Hotel & Guest House Going Concern in Entebbe",
    "Hotel / Guest House",
    "commercial",
    "sale",
    3_400_000_000,
    "Entebbe",
    "Wakiso",
    "Central Region",
    22,
    22,
    24,
    15,
    "1.5 Acres",
    getUpcImages("prop-entebbe-hotel-014", 5),
  ],
  [
    "Commercial Plaza with 6 Operating Shops in Kira",
    "Shop",
    "commercial",
    "sale",
    1_450_000_000,
    "Kira",
    "Wakiso",
    "Central Region",
    0,
    6,
    8,
    8,
    "40 Decimals",
    getUpcImages("prop-kira-plaza-015", 5),
  ],
  [
    "Developed Commercial Premises in Soroti Central",
    "Hotel / Guest House",
    "commercial",
    "sale",
    850_000_000,
    "Soroti Central",
    "Soroti",
    "Eastern Region",
    14,
    14,
    16,
    10,
    "50 Decimals",
    getUpcImages("prop-soroti-comm-016", 5),
  ],
  [
    "Large Warehouse Facility in Kampala Industrial Area",
    "Warehouse",
    "commercial",
    "sale",
    4_200_000_000,
    "Industrial Area",
    "Kampala",
    "Central Region",
    0,
    4,
    6,
    20,
    "2 Acres",
    getUpcImages("prop-kla-warehouse-017", 5),
  ],

  // --- HOUSES FOR RENT ---
  [
    "3 Bedroom Executive Townhouse in Ntinda",
    "Townhouse",
    "houses",
    "rent",
    3_800_000,
    "Ntinda",
    "Kampala",
    "Central Region",
    3,
    3,
    4,
    2,
    "Compound",
    getUpcImages("prop-ntinda-th-018", 5),
  ],
  [
    "4 Bedroom Luxury Lake View Bungalow in Entebbe",
    "Semi-detached Bungalow",
    "houses",
    "rent",
    4_500_000,
    "Entebbe Municipality",
    "Wakiso",
    "Central Region",
    4,
    4,
    4,
    3,
    "Spacious Garden",
    getUpcImages("prop-entebbe-bung-019", 5),
  ],
  [
    "Modern 4 Bedroom Bungalow in Bugolobi",
    "Detached Bungalow",
    "houses",
    "rent",
    5_000_000,
    "Bugolobi",
    "Kampala",
    "Central Region",
    4,
    3,
    4,
    3,
    "25 Decimals",
    getUpcImages("prop-bugolobi-020", 5),
  ],
  [
    "3 Bedroom House in Gulu Layibi",
    "House",
    "houses",
    "rent",
    1_200_000,
    "Layibi",
    "Gulu",
    "Northern Region",
    3,
    2,
    2,
    2,
    "Fenced Plot",
    getUpcImages("prop-gulu-021", 5),
  ],

  // --- FLATS & APARTMENTS FOR RENT ---
  [
    "2 Bedroom Furnished Luxury Apartment in Kololo",
    "Apartment",
    "flats",
    "rent",
    2_500_000,
    "Kololo",
    "Kampala",
    "Central Region",
    2,
    2,
    3,
    2,
    "140 sqm",
    getUpcImages("prop-kololo-flat-022", 5),
  ],
  [
    "Executive 3 Bedroom Apartment in Nakasero",
    "Apartment",
    "flats",
    "rent",
    4_200_000,
    "Nakasero",
    "Kampala",
    "Central Region",
    3,
    3,
    4,
    2,
    "210 sqm",
    getUpcImages("prop-nakasero-023", 5),
  ],
  [
    "Fully Serviced Shortlet 2-Bed Apartment in Bugolobi",
    "Apartment",
    "shortlets",
    "shortlet",
    350_000,
    "Bugolobi",
    "Kampala",
    "Central Region",
    2,
    2,
    2,
    1,
    "120 sqm",
    getUpcImages("prop-bugolobi-short-024", 5),
  ],
  [
    "Stylish 1 Bedroom Furnished Flat in Naalya",
    "Mini Flat",
    "flats",
    "rent",
    1_200_000,
    "Naalya",
    "Wakiso",
    "Central Region",
    1,
    1,
    1,
    1,
    "70 sqm",
    getUpcImages("prop-naalya-025", 5),
  ],
  [
    "Spacious 3 Bedroom Apartment in Kisaasi",
    "Apartment",
    "flats",
    "rent",
    1_800_000,
    "Kisaasi",
    "Kampala",
    "Central Region",
    3,
    2,
    3,
    2,
    "160 sqm",
    getUpcImages("prop-kisaasi-026", 5),
  ],
  [
    "Luxury 2 Bedroom Apartment in Entebbe Katabi",
    "Apartment",
    "flats",
    "rent",
    2_000_000,
    "Katabi",
    "Wakiso",
    "Central Region",
    2,
    2,
    2,
    2,
    "130 sqm",
    getUpcImages("prop-katabi-027", 5),
  ],

  // --- LAND FOR RENT / JV ---
  [
    "Joint Venture Opportunity — 3 Acres Prime Lakeview Land",
    "Mixed-use Land",
    "land",
    "jv",
    0,
    "Kigo",
    "Wakiso",
    "Central Region",
    0,
    0,
    0,
    0,
    "3.0 Acres",
    getUpcImages("prop-kigo-jv-028", 5),
  ],
  [
    "Commercial Yard for Lease — 2 Acres Banda",
    "Commercial Land",
    "land",
    "rent",
    8_000_000,
    "Banda",
    "Kampala",
    "Central Region",
    0,
    0,
    0,
    0,
    "2.0 Acres",
    getUpcImages("prop-banda-029", 5),
  ],

  // --- COMMERCIAL FOR RENT ---
  [
    "Prime Office Space in Kingdom Kampala",
    "Office Space",
    "offices",
    "rent",
    6_500_000,
    "Kampala Road",
    "Kampala",
    "Central Region",
    0,
    2,
    2,
    4,
    "350 sqm",
    getUpcImages("prop-kla-office-030", 5),
  ],
  [
    "Heavy Duty Warehouse on 1 Acre in Industrial Area",
    "Warehouse",
    "commercial",
    "rent",
    12_000_000,
    "Industrial Area",
    "Kampala",
    "Central Region",
    0,
    2,
    2,
    10,
    "1 Acre Facility",
    getUpcImages("prop-kla-warehouse-rent-031", 5),
  ],
  [
    "Retail Shop in Busy City Arcade",
    "Shop",
    "commercial",
    "rent",
    1_800_000,
    "Kikuubo",
    "Kampala",
    "Central Region",
    0,
    1,
    1,
    0,
    "45 sqm",
    getUpcImages("prop-kikuubo-032", 5),
  ],
  [
    "Guest House Complex for Lease in Fort Portal",
    "Hotel / Guest House",
    "commercial",
    "rent",
    5_000_000,
    "Fort Portal",
    "Kabarole",
    "Western Region",
    12,
    12,
    12,
    8,
    "80 Decimals",
    getUpcImages("prop-fportal-033", 5),
  ],

  // --- VEHICLES FOR SALE ---
  [
    "Toyota Hilux Double Cab 2022 for Sale",
    "Pickup",
    "vehicles",
    "sale",
    85_000_000,
    "Kampala",
    "Kampala",
    "Central Region",
    0,
    0,
    0,
    5,
    "2022 Model",
    getUpcImages("prop-hilux-034", 5),
  ],
  [
    "Toyota Land Cruiser V8 2021 for Sale",
    "SUV",
    "vehicles",
    "sale",
    180_000_000,
    "Kololo",
    "Kampala",
    "Central Region",
    0,
    0,
    0,
    5,
    "2021 Model",
    getUpcImages("prop-landcruiser-035", 5),
  ],
  [
    "Toyota Hiace Bus 2020 for Sale",
    "Bus",
    "vehicles",
    "sale",
    120_000_000,
    "Nakawa",
    "Kampala",
    "Central Region",
    0,
    0,
    0,
    2,
    "2020 Model",
    getUpcImages("prop-hiace-036", 5),
  ],

  // --- VEHICLES FOR RENT ---
  [
    "Toyota Alphard 2023 for Rent",
    "SUV",
    "vehicles",
    "rent",
    3_500_000,
    "Kampala",
    "Kampala",
    "Central Region",
    0,
    0,
    0,
    5,
    "Monthly Rental",
    getUpcImages("prop-alphard-037", 5),
  ],
  [
    "Toyota Hiace Commuter Bus for Rent",
    "Bus",
    "vehicles",
    "rent",
    4_200_000,
    "Entebbe",
    "Entebbe",
    "Central Region",
    0,
    0,
    0,
    2,
    "Monthly Rental",
    getUpcImages("prop-hiace-rent-038", 5),
  ],
];

const categoryCounters: Record<string, number> = {};
const categoryPrefixes: Record<string, string> = {
  houses: "HSE",
  flats: "FLT",
  land: "LND",
  commercial: "COM",
  offices: "OFF",
  shortlets: "SHT",
  vehicles: "VEH",
};

export const LISTINGS: Listing[] = seeds.map((s, i) => {
  const [
    title,
    type,
    category,
    listing,
    price,
    area,
    district,
    region,
    beds,
    baths,
    toilets,
    parking,
    plotSize,
    images,
  ] = s;
  const baseFeatures = F.slice(i % 5, (i % 5) + 6);
  const isApartmentBlock =
    title.toLowerCase().includes("apartment block") || area.toLowerCase().includes("kyaliwajjala");

  if (!categoryCounters[category]) categoryCounters[category] = 0;
  categoryCounters[category]++;
  const catPrefix = categoryPrefixes[category] || "PROP";
  const catNumber = categoryCounters[category];
  const id = `${catPrefix}-${String(catNumber).padStart(3, "0")}`;
  const ref = `AMD-${catPrefix}${String(1000 + catNumber).padStart(4, "0")}`;
  const slug = generatePropertySlug({ beds, type, listing, district, area, ref, id });
  const metaTitle = `${beds && beds > 0 ? `${beds} Bedroom ` : ""}${type} for ${listing === "rent" ? "Rent" : listing === "sale" ? "Sale" : "Lease"} in ${area}, ${district} | Amdern Properties`;
  const metaDescription = `${type} for ${listing} in ${area}, ${district}. Price: ${formatUGX(price)}. Ref: ${ref}. Verified real estate in Uganda with AMDERN PROPERTIES SMC LTD.`;

  const features = title.toLowerCase().includes("kiwatule")
    ? [
        "10 units (all occupied)",
        "Monthly rental collection: UGX 9,000,000",
        "Titled land",
        "Secure compound",
        "Good rental yield",
        "Ample parking",
      ]
    : title.includes("Off Kira - Kasangati Road")
      ? ["2 Boys quarters", "5 bedroom ensuite", "Large family lounge", ...baseFeatures].slice(0, 6)
      : title.includes("QUICK SALE")
        ? [
            "Seated on 50ft by 50ft plot",
            "3 bedrooms, sitting room and dining",
            "Kitchen and bathroom",
            "Car parking space",
            "Water and electricity available",
            "Genuine sale agreement",
          ]
        : title.includes("Brand New House for Sale")
          ? [
              "4 bedrooms with boys quarters",
              "Title land",
              "20 decimals",
              "Located on Seeta - Namiyango Road",
              "Water and electricity available",
              "400m from main road",
            ]
          : title.toLowerCase().includes("fully-furnished") ||
              title.toLowerCase().includes("flat home") ||
              title.toLowerCase().includes("namugongo")
            ? [
                "Fully furnished",
                "6 bedrooms",
                "5 bathrooms",
                "15 decimals (title land)",
                "Close to main road (approx 830m)",
                "Water & electricity connected",
              ]
            : isApartmentBlock
              ? [
                  "12 units (8 x UGX 1.2M, 4 x UGX 1.0M)",
                  "Monthly rental collection: UGX 12,800,000",
                  "Modern open kitchens",
                  "Balconies",
                  "Secure compound",
                  "Good rental yield",
                ]
              : baseFeatures;

  let description = title.includes("QUICK SALE")
    ? "This genuine quick-sale house in Matugga Kiryagonja sits on a 50ft by 50ft plot and offers 3 bedrooms, a sitting room, dining area, kitchen, bathroom, and parking. Water and electricity are available, and the sale is backed by a genuine sale agreement."
    : title.includes("Brand New House for Sale")
      ? "Brand new 4-bedroom house for sale on title land in Seeta - Namiyango Road. The property sits on 20 decimals and includes boys quarters, ample living space, and a convenient location about 400m from the main road. Water and electricity are available."
      : title.toLowerCase().includes("fully-furnished") ||
          title.toLowerCase().includes("flat home") ||
          title.toLowerCase().includes("namugongo")
        ? "Fully-furnished 6-bedroom property on title land (15 decimals) in Namugongo - Nabusugwe, featuring 5 bathrooms, spacious living areas, and immediate access to utilities. Approximately 830m from the main road."
        : isApartmentBlock
          ? area.toLowerCase().includes("kyaliwajjala")
            ? "APARTMENT BLOCK FOR SALE — Location: Kyaliwajjala. Price: UGX 1,700,000,000. Monthly rental collection: UGX 12,800,000. Land size: 13 decimals. Details: 12 units all with spacious sitting room, modern open kitchen, spacious bedroom, self-contained, with a balcony. Rented: 8 units at UGX 1,200,000/month and 4 units at UGX 1,000,000/month."
            : `Apartment block for sale in ${area}, ${district}. 12 units in total — 8 units rented at UGX 1,200,000/month and 4 units rented at UGX 1,000,000/month. Monthly rental collection approximately UGX 12,800,000. Ideal for investors seeking steady rental income on ${plotSize || "13 decimals"} of land.`
          : desc(type, `${area}, ${district}`);

  // Special-case description for Kiwatule apartment listing
  if (title.toLowerCase().includes("kiwatule")) {
    description = `APARTMENT BLOCK FOR SALE — Location: Kiwatule. 10 units, all occupied. Monthly rental collection: UGX 9,000,000. Asking price: UGX 1,500,000,000 (Negotiable). Titled land.`;
  }

  return {
    id,
    ref,
    slug,
    metaTitle,
    metaDescription,
    title,
    type,
    category,
    listing,
    price,
    period: listing === "rent" ? "month" : listing === "shortlet" ? "night" : undefined,
    area,
    district,
    region,
    beds,
    baths,
    toilets,
    parking,
    plotSize,
    sizeSqm: category === "land" ? 2000 + i * 350 : 120 + i * 25,
    serviced: i % 3 === 0,
    furnished: i % 4 === 0,
    shared: i % 7 === 0,
    addedDaysAgo: (i * 2) % 30,
    images: images.length > 0 ? images : ["/placeholder.png"],
    video: i === 0 ? "/property-media/1000433632.mp4" : undefined,
    photoCount: images.length + 4,
    description,
    features,
    agentId: "amdern-hq",
    currency:
      title.toUpperCase().includes("BWEBAJJA ENTEBBE ROAD") ||
      title.toUpperCase().includes("AKRIGHT BWEBAJJA")
        ? "USD"
        : "UGX",
    badge:
      i % 4 === 0
        ? "Featured"
        : i % 4 === 1
          ? "Verified photos"
          : i % 4 === 2
            ? "Hot Deal"
            : undefined,
  };
});

// Ensure the Kira - Mulawa listing uses the requested reference and photos
const kiraListing = LISTINGS.find(
  (l) =>
    (l.title && l.title.toLowerCase().includes("kira - mulawa")) ||
    (l.area && l.area.toLowerCase().includes("kira - mulawa")),
);
if (kiraListing) {
  kiraListing.ref = "AMD-HSE1013";
}

export type Agent = {
  id: string;
  name: string;
  kind: "agent" | "developer";
  area: string;
  phone: string;
  phone2?: string;
  email: string;
  listings: number;
  about: string;
};

export const AGENTS: Agent[] = [
  {
    id: "amdern-hq",
    name: "AMDERN PROPERTIES SMC LTD",
    kind: "agent",
    area: "Kampala / Wakiso / Nationwide",
    phone: "+256 702 104 499",
    phone2: "+256 786 793 139",
    email: "amdernsmcpropertiesltd@gmail.com",
    listings: 250,
    about:
      "Full service real estate agency covering residential homes, modern apartments, genuine titled land, and commercial properties across Uganda.",
  },
];

export function agentById(id: string) {
  return AGENTS.find((a) => a.id === id) ?? AGENTS[0]!;
}

export function listingById(id: string) {
  return LISTINGS.find((l) => l.id === id);
}

export function formatUGX(value: number) {
  if (!value) return "Price on application";
  return `USh ${value.toLocaleString("en-US")}`;
}

export function formatUSD(value: number) {
  if (!value) return "POA";
  const usd = Math.round(value / 3750);
  return `$${usd.toLocaleString("en-US")}`;
}

export function formatPrice(value: number, currency: string = "UGX"): string {
  if (!value) return "Price on application";
  if (currency === "USD") {
    return formatUSD(value);
  }
  return formatUGX(value);
}

export function shortPrice(value: number, currency: string = "UGX") {
  if (!value) return "POA";
  if (currency === "USD") {
    const usd = Math.round(value / 3750);
    if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`;
    if (usd >= 1_000) return `$${(usd / 1_000).toFixed(1)}k`;
    return `$${usd.toLocaleString("en-US")}`;
  }
  if (value >= 1_000_000_000)
    return `USh ${(value / 1_000_000_000).toFixed(2).replace(/\.00$/, "")}B`;
  if (value >= 1_000_000) return `USh ${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  return `USh ${value.toLocaleString("en-US")}`;
}

export type Filters = {
  listing?: string | undefined;
  location?: string | undefined;
  type?: string | undefined;
  min?: number | undefined;
  max?: number | undefined;
  beds?: number | undefined;
  category?: string | undefined;
  furnishing?: string | undefined;
  q?: string | undefined;
  sort?: string | undefined;
};

export function filterListings(f: Filters, source: Listing[] = LISTINGS): Listing[] {
  let out = source.filter((l) => {
    if (f.listing && f.listing !== "all" && l.listing !== f.listing) {
      if (f.listing === "sale" && l.listing !== "sale") return false;
      if (f.listing === "rent" && l.listing !== "rent" && l.listing !== "shortlet") return false;
    }
    if (f.category && f.category !== "all") {
      if (f.category === "houses" && l.category !== "houses") return false;
      if (
        (f.category === "flats" || f.category === "flats-apartments") &&
        l.category !== "flats" &&
        l.category !== "shortlets"
      )
        return false;
      if (f.category === "land" && l.category !== "land") return false;
      if (
        (f.category === "commercial" || f.category === "offices") &&
        l.category !== "commercial" &&
        l.category !== "offices"
      )
        return false;
      if (f.category === "vehicles" && l.category !== "vehicles") return false;
    }
    if (f.type && l.type !== f.type) return false;
    if (f.min && l.price && l.price < f.min) return false;
    if (f.max && l.price && l.price > f.max) return false;
    if (f.beds && l.beds < f.beds) return false;
    if (f.furnishing === "furnished" && !l.furnished) return false;
    if (f.furnishing === "serviced" && !l.serviced) return false;
    if (f.location) {
      const s = f.location.toLowerCase();
      const hay = `${l.area} ${l.district} ${l.region}`.toLowerCase();
      if (!hay.includes(s)) return false;
    }
    if (f.q) {
      const s = f.q.toLowerCase();
      if (
        !`${l.title} ${l.type} ${l.ref} ${l.description} ${l.area} ${l.district}`
          .toLowerCase()
          .includes(s)
      )
        return false;
    }
    return true;
  });

  if (f.sort === "price-asc") out = [...out].sort((a, b) => a.price - b.price);
  else if (f.sort === "price-desc") out = [...out].sort((a, b) => b.price - a.price);
  else if (f.sort === "newest") out = [...out].sort((a, b) => a.addedDaysAgo - b.addedDaysAgo);
  return out;
}

import {
  getListingBySlug,
  getListingById as dbGetListingById,
  getAgentById as dbGetAgentById,
  getListings as dbGetListings,
} from "./db";

export function mapRowToListing(row: unknown): Listing {
  if (!row || typeof row !== "object") {
    return LISTINGS[0]!;
  }
  const r = row as Record<string, unknown>;
  const rawImages = Array.isArray(r["images"])
    ? (r["images"] as unknown[]).map(String)
    : [];
  const id = String(r["id"] || "");
  const ref = String(r["ref"] || `AMD-${id}`);
  const title = String(r["title"] || "Property in Uganda");
  const type = String(r["type"] || "Residential Property");
  const listing = ((r["listing_type"] || r["listing"] || "sale") as Listing["listing"]);
  const area = (r["area"] as { name: string } | null)?.name || String(r["district"] || r["area"] || "Kampala");
  const district = String(r["district"] || "Kampala");
  const beds = Number(r["beds"] || 0);
  const slug = String(r["slug"] || generatePropertySlug({ beds, type, listing, district, area, ref, id }));
  const metaTitle = (r["meta_title"] as string | undefined) || `${beds > 0 ? `${beds} Bedroom ` : ""}${type} for ${listing === "rent" ? "Rent" : "Sale"} in ${area}, ${district} | Amdern Properties`;
  const metaDescription = (r["meta_description"] as string | undefined) || String(r["description"] || "Prime property listed with AMDERN PROPERTIES SMC LTD.");
  const images = rawImages.length > 0 ? rawImages : getUpcImages(id || "prop", 4);

  return {
    id,
    ref,
    slug,
    metaTitle,
    metaDescription,
    title,
    type,
    category: (r["category"] as Listing["category"]) || "houses",
    listing,
    price: Number(r["price"] || 0),
    period: (r["period"] as Listing["period"]) || undefined,
    area,
    district,
    region: String(r["region"] || "Central Region"),
    beds: Number(r["beds"] || 0),
    baths: Number(r["baths"] || 0),
    toilets: Number(r["toilets"] || 0),
    sizeSqm: Number(r["size_sqm"] || r["sizeSqm"] || 120),
    serviced: Boolean(r["serviced"]),
    furnished: Boolean(r["furnished"]),
    shared: Boolean(r["shared"]),
    addedDaysAgo: r["created_at"]
      ? Math.floor(
          (Date.now() - new Date(String(r["created_at"])).getTime()) / (1000 * 60 * 60 * 24),
        )
      : Number(r["addedDaysAgo"] || 0),
    images,
    description: String(r["description"] || "Prime property listed with AMDERN PROPERTIES SMC LTD."),
    features: Array.isArray(r["features"]) ? (r["features"] as unknown[]).map(String) : [],
    agentId: String(r["agent_id"] || r["agentId"] || "amdern-hq"),
    badge: (r["badge"] as string | null) || undefined,
    status: (r["status"] as string | undefined) ?? "active",
    viewCount: Number(r["view_count"] || r["viewCount"] || 0),
    moderationStatus: (r["moderation_status"] as string | undefined) ?? "approved",
  };
}

export async function listingByIdAsync(id: string): Promise<Listing | null> {
  return dbGetListingById(id);
}

export async function listingBySlugAsync(slug: string): Promise<Listing | null> {
  return getListingBySlug(slug);
}

export async function agentByIdAsync(id: string) {
  return dbGetAgentById(id);
}

export async function filterListingsAsync(f: Filters) {
  return dbGetListings(f);
}

export async function getListingsCountAsync() {
  const { getListingsCount } = await import("./db");
  return getListingsCount();
}

export async function getAgentsCountAsync() {
  const { getAgentsCount } = await import("./db");
  return getAgentsCount();
}

export async function getAreasCountAsync() {
  return REGIONS.reduce<number>((acc: number, r) => acc + (r.districts?.length || 0), 0);
}
