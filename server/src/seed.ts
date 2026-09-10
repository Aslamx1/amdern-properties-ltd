import bcrypt from "bcryptjs";
import prisma from "./config/db";
import { Role, PropertyCategory, ListingType, AdType } from "@prisma/client";
import { generatePropertySlug } from "./utils/slug";

async function main() {
  console.log("[Seed] Starting database seeding for Amdern Properties...");

  // 1. Seed System Admin & Agent Users
  const passwordHash = await bcrypt.hash("AmdernAdmin2026!", 12);

  const adminPasswordHash = await bcrypt.hash("amdern@", 12);

  const mainAdmin = await prisma.user.upsert({
    where: { email: "amdern@smc.com" },
    update: {
      password: adminPasswordHash,
      role: Role.ADMIN,
      isVerified: true,
      name: "Amdern Administrator",
    },
    create: {
      name: "Amdern Administrator",
      email: "amdern@smc.com",
      password: adminPasswordHash,
      phone: "+256 700 000 000",
      role: Role.ADMIN,
      isVerified: true,
      privacyPolicyAgreed: true,
      privacyAgreedAt: new Date(),
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@amdernpropertiessmclimited.com" },
    update: {},
    create: {
      name: "Amdern SMC Executive Admin",
      email: "admin@amdernpropertiessmclimited.com",
      password: passwordHash,
      phone: "+256 700 000 001",
      role: Role.ADMIN,
      isVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200",
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: "agent.kololo@amdernpropertiessmclimited.com" },
    update: {},
    create: {
      name: "Sarah Nalwanga (Senior Associate)",
      email: "agent.kololo@amdernpropertiessmclimited.com",
      password: passwordHash,
      phone: "+256 772 123 456",
      role: Role.AGENT,
      isVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
    },
  });

  console.log(`[Seed] Seeded Users: ${admin.email}, ${agent.email}`);

  // 2. Seed Real Estate Properties with Spatial PostGIS Coordinates (Kampala & Entebbe)
  const sampleProperties = [
    {
      title: "Ultra-Luxury 4 Bedroom Penthouse with Infinity Pool",
      propertyType: "Penthouse",
      category: PropertyCategory.FLATS,
      listingType: ListingType.RENT,
      price: 12000000,
      currency: "UGX",
      period: "month",
      bedrooms: 4,
      bathrooms: 4,
      toilets: 5,
      parking: 3,
      sizeSqm: 380,
      description: "Magnificent high-floor penthouse overlooking the Kampala golf course in upscale Kololo. Features private elevator access, Italian marble finishing, smart home automation, and 24/7 armed security.",
      district: "Kampala",
      area: "Kololo",
      region: "Central",
      lat: 0.3298,
      lng: 32.5932,
      isFeatured: true,
      amenities: ["Swimming Pool", "Gym", "Standby Generator", "Security Guard", "Fibre Internet", "Balcony"],
      features: ["Panoramic View", "Air Conditioning", "Servants Quarters", "Modern Kitchen"],
      images: [
        { imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200", isPrimary: true },
        { imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200", isPrimary: false },
      ],
    },
    {
      title: "Contemporary 5 Bedroom Executive Villa on Half Acre",
      propertyType: "Villa",
      category: PropertyCategory.HOUSES,
      listingType: ListingType.SALE,
      price: 1850000000,
      currency: "UGX",
      bedrooms: 5,
      bathrooms: 5,
      toilets: 6,
      parking: 6,
      sizeSqm: 620,
      plotSize: "50 Decimals",
      description: "Exceptional executive residence in diplomatic Nakasero enclave. Lush landscaped gardens, imported fittings, perimeter electric fence, double servants quarters, and private swimming pool.",
      district: "Kampala",
      area: "Nakasero",
      region: "Central",
      lat: 0.3225,
      lng: 32.5786,
      isFeatured: true,
      amenities: ["Private Pool", "Electric Fence", "CCTV", "Lush Lawn", "Solar Power System"],
      features: ["Mailo Land Title", "Walk-in Closets", "Ensuite Bedrooms"],
      images: [
        { imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200", isPrimary: true },
        { imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200", isPrimary: false },
      ],
    },
    {
      title: "Lakeview 3 Bedroom Furnished Apartment",
      propertyType: "Apartment",
      category: PropertyCategory.FLATS,
      listingType: ListingType.RENT,
      price: 4500000,
      currency: "UGX",
      period: "month",
      bedrooms: 3,
      bathrooms: 3,
      toilets: 3,
      parking: 2,
      sizeSqm: 210,
      description: "Serene lakeside living in Muyenga Tank Hill. Breathtaking views of Lake Victoria, fully equipped modern kitchen, backup water supply, and tranquil green surroundings.",
      district: "Kampala",
      area: "Muyenga",
      region: "Central",
      lat: 0.2985,
      lng: 32.6120,
      isFeatured: false,
      amenities: ["Lake View", "Furnished", "Water Heaters", "Intercom", "Secure Parking"],
      features: ["Quiet Neighborhood", "Near International Schools"],
      images: [
        { imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200", isPrimary: true },
      ],
    },
    {
      title: "Prime Commercial Office Floor on Kampala Road",
      propertyType: "Office",
      category: PropertyCategory.COMMERCIAL,
      listingType: ListingType.RENT,
      price: 18000000,
      currency: "UGX",
      period: "month",
      bedrooms: 0,
      bathrooms: 4,
      toilets: 6,
      parking: 10,
      sizeSqm: 500,
      description: "Grade A office space in Kampala Central Business District. Ready for partitioning, central air conditioning, dual high-speed elevators, and fiber-optic connectivity.",
      district: "Kampala",
      area: "Central CBD",
      region: "Central",
      lat: 0.3136,
      lng: 32.5811,
      isFeatured: false,
      amenities: ["Backup Generator", "High-speed Elevators", "Fire Suppression System"],
      features: ["CBD Location", "Ample Basement Parking"],
      images: [
        { imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200", isPrimary: true },
      ],
    },
    {
      title: "1 Acre Beachfront Commercial Resort Land",
      propertyType: "Land",
      category: PropertyCategory.LAND,
      listingType: ListingType.SALE,
      price: 750000000,
      currency: "UGX",
      bedrooms: 0,
      bathrooms: 0,
      toilets: 0,
      parking: 0,
      sizeSqm: 4046,
      plotSize: "100 Decimals (1 Acre)",
      description: "Prime freehold lakefront development land in Entebbe near the international airport. Perfect for a boutique hotel, eco-lodge, or exclusive residential apartments.",
      district: "Wakiso",
      area: "Entebbe",
      region: "Central",
      lat: 0.0512,
      lng: 32.4637,
      isFeatured: true,
      amenities: ["Direct Lake Frontage", "Tarmac Road Access", "Electricity on Site"],
      features: ["Ready Freehold Title", "Clean Survey"],
      images: [
        { imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200", isPrimary: true },
      ],
    },
  ];

  for (const item of sampleProperties) {
    const slug = generatePropertySlug({
      bedrooms: item.bedrooms,
      propertyType: item.propertyType,
      listingType: item.listingType,
      district: item.district,
      title: item.title,
    });

    const prop = await prisma.property.create({
      data: {
        userId: agent.id,
        title: item.title,
        slug,
        propertyType: item.propertyType,
        category: item.category,
        listingType: item.listingType,
        price: item.price,
        currency: item.currency,
        period: item.period || null,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        toilets: item.toilets,
        parking: item.parking,
        sizeSqm: item.sizeSqm || null,
        plotSize: item.plotSize || null,
        description: item.description,
        district: item.district,
        area: item.area,
        region: item.region,
        lat: item.lat,
        lng: item.lng,
        isFeatured: item.isFeatured,
        amenities: JSON.stringify(item.amenities),
        features: JSON.stringify(item.features),
        images: {
          create: item.images.map((img, idx) => ({
            imageUrl: img.imageUrl,
            webpUrl: img.imageUrl,
            thumbUrl: img.imageUrl,
            isPrimary: img.isPrimary,
            sortOrder: idx,
          })),
        },
      },
    });

    console.log(`[Seed] Created property: ${prop.title} (${prop.slug})`);
  }

  // 3. Seed Ad Placements
  const sampleAds = [
    {
      title: "Centenary Bank Home Loans - Fast Approval",
      slot: "search_feed",
      adType: AdType.IMAGE,
      imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop&q=80",
      targetUrl: "https://centenarybank.co.ug",
      isActive: true,
    },
    {
      title: "Stanbic Bank Uganda - Diaspora Mortgage Financing",
      slot: "search_feed",
      adType: AdType.IMAGE,
      imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=80",
      targetUrl: "https://stanbicbank.co.ug",
      isActive: true,
    },
    {
      title: "Roko Construction - Premium Architecture & Build",
      slot: "sidebar_rect",
      adType: AdType.IMAGE,
      imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18625f2?w=600&auto=format&fit=crop&q=80",
      targetUrl: "https://amdernpropertiessmclimited.com/contact",
      isActive: true,
    },
  ];

  for (const ad of sampleAds) {
    const createdAd = await prisma.adPlacement.create({
      data: ad,
    });
    console.log(`[Seed] Created Ad Placement: ${createdAd.title} for slot [${createdAd.slot}]`);
  }

  console.log("[Seed] Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("[Seed Error]:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
