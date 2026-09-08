export const SITE = {
  name: "AMDERN PROPERTIES SMC LTD",
  short: "Amdern Properties",
  tagline: "Uganda's Premier Real Estate & Property Marketplace",
  email: "amdernsmcpropertiesltd@gmail.com",
  domain: "amdernsmcpropertiesltd.com",
  phone: "+256 702 104 499",
  phone2: "+256 786 793 139",
  phones: ["+256 702 104 499", "+256 786 793 139"],
  phoneDisplay: "+256 702 104 499 / +256 786 793 139",
  whatsapp: "256702104499",
  whatsapp2: "256786793139",
  address: "Matugga Opp, Matugga Health Centre Road, Wakiso / Kampala, Uganda",
};

export function getWhatsAppLink(
  phone: string = SITE.whatsapp,
  message: string = "Hello AMDERN PROPERTIES SMC LTD, I would like to make an enquiry.",
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function getMailtoLink(subject: string, body: string, email: string = SITE.email): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export const REGIONS = [
  {
    slug: "central",
    name: "Central Region",
    letter: "C",
    count: 37,
    districts: [
      "Akright Bwebajja",
      "Banda",
      "Bugolobi",
      "Bwebajja",
      "Bwebajja, Entebbe Road",
      "Bweyogere-Namanve",
      "Entebbe",
      "Entebbe Municipality",
      "Industrial Area",
      "Kampala",
      "Kampala Road",
      "Katabi",
      "Kayunga",
      "Kigo",
      "Kikuubo",
      "Kira",
      "Kira - Mulawa",
      "Kira Butenga",
      "Kisaasi",
      "Kiwatule",
      "Kololo",
      "Kyaliwajjala",
      "Matugga Kiryagonja",
      "Matugga Sanga",
      "Mukono",
      "Naalya",
      "Nakasero",
      "Nakawa",
      "Namugongo - Misindye",
      "Namugongo - Nabusugwe",
      "Namugongo (U-Branch off Anglican Church)",
      "Namugongo Jinja-Misindye",
      "Namugongo Ssonde",
      "Ntinda",
      "Off Kira - Kasangati Road",
      "Seeta - Namiyango Road",
      "Sseguku Katale, Entebbe Road",
      "Wakiso",
    ],
  },
  {
    slug: "eastern",
    name: "Eastern Region",
    letter: "E",
    count: 2,
    districts: ["Kiti Kansangati Mtuga Road", "Soroti", "Soroti Central"],
  },
  {
    slug: "western",
    name: "Western Region",
    letter: "W",
    count: 1,
    districts: ["Fort Portal", "Kabarole"],
  },
  {
    slug: "northern",
    name: "Northern Region",
    letter: "N",
    count: 1,
    districts: ["Gulu", "Layibi"],
  },
];

export const PROPERTY_TYPE_GROUPS = [
  {
    group: "Flats / Apartments",
    types: [
      "Apartment",
      "Mini Flat",
      "Self Contained (Single Rooms)",
      "Block of Flats",
      "Penthouse",
    ],
  },
  {
    group: "Houses",
    types: [
      "House",
      "Townhouse",
      "Detached Duplex",
      "Semi-detached Duplex",
      "Detached Bungalow",
      "Semi-detached Bungalow",
      "Terraced Bungalow",
      "Terraced Duplex",
      "Mansion",
    ],
  },
  {
    group: "Land",
    types: [
      "Residential Land",
      "Commercial Land",
      "Industrial Land",
      "Mixed-use Land",
      "Agricultural Land / Farm",
    ],
  },
  {
    group: "Commercial Property",
    types: [
      "Office Space",
      "Shop",
      "Warehouse",
      "Plaza / Complex / Mall",
      "Hotel / Guest House",
      "Factory",
      "School",
      "Restaurant / Bar",
      "Filling Station",
      "Hostel",
    ],
  },
  {
    group: "Vehicles",
    types: [
      "Car",
      "Motorcycle",
      "Bicycle",
      "Bus",
      "Truck",
      "Pickup",
      "Van",
      "SUV",
      "Sedan",
      "Trailer",
    ],
  },
];

export const CURRENCIES = [
  { code: "UGX", label: "USh · UGX", symbol: "USh", rateToUGX: 1 },
  { code: "USD", label: "$ · USD", symbol: "$", rateToUGX: 3750 },
  { code: "GBP", label: "£ · GBP", symbol: "£", rateToUGX: 4750 },
  { code: "EUR", label: "€ · EUR", symbol: "€", rateToUGX: 4100 },
  { code: "KES", label: "KSh · KES", symbol: "KSh", rateToUGX: 29 },
  { code: "CAD", label: "C$ · CAD", symbol: "C$", rateToUGX: 2750 },
];

export const CATEGORIES = [
  { name: "Houses", slug: "houses", count: "250+ listings", type: "House" },
  {
    name: "Flats & Apartments",
    slug: "flats-apartments",
    count: "250+ listings",
    type: "Apartment",
  },
  { name: "Land & Plots", slug: "land", count: "250+ listings", type: "Residential Land" },
  { name: "Commercial", slug: "commercial", count: "80+ listings", type: "Commercial" },
  { name: "Shortlets", slug: "shortlets", count: "25+ listings", type: "Apartment" },
  { name: "Office Spaces", slug: "offices", count: "40+ listings", type: "Office Space" },
  { name: "Cars & Vehicles", slug: "vehicles", count: "60+ listings", type: "Vehicle" },
];
