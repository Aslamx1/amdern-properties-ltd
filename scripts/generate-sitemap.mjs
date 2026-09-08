// scripts/generate-sitemap.mjs
// Generates production-ready Google-compliant XML Sitemap for Amdern Properties SMC Limited

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const sitemapPath = path.join(publicDir, "sitemap.xml");

const BASE_URL = "https://amdernpropertiessmclimited.com";
const now = new Date().toISOString().split("T")[0];

// Import listings from TS/build or parse listings directly
async function generateSitemap() {
  console.log("Generating XML Sitemap for Amdern Properties...");

  const urls = [];

  // 1. Static Core Pages
  const staticPages = [
    { loc: "/", changefreq: "daily", priority: "1.0" },
    { loc: "/for-sale", changefreq: "daily", priority: "0.9" },
    { loc: "/for-rent", changefreq: "daily", priority: "0.9" },
    { loc: "/for-sale/houses", changefreq: "daily", priority: "0.8" },
    { loc: "/for-sale/flats-apartments", changefreq: "daily", priority: "0.8" },
    { loc: "/for-sale/land", changefreq: "daily", priority: "0.8" },
    { loc: "/for-sale/commercial", changefreq: "daily", priority: "0.8" },
    { loc: "/for-sale/vehicles", changefreq: "weekly", priority: "0.7" },
    { loc: "/for-rent/houses", changefreq: "daily", priority: "0.8" },
    { loc: "/for-rent/flats-apartments", changefreq: "daily", priority: "0.8" },
    { loc: "/for-rent/land", changefreq: "daily", priority: "0.8" },
    { loc: "/for-rent/commercial", changefreq: "daily", priority: "0.8" },
    { loc: "/for-rent/vehicles", changefreq: "weekly", priority: "0.7" },
    { loc: "/agents", changefreq: "weekly", priority: "0.7" },
    { loc: "/developers", changefreq: "weekly", priority: "0.7" },
    { loc: "/about", changefreq: "monthly", priority: "0.5" },
    { loc: "/contact", changefreq: "monthly", priority: "0.5" },
    { loc: "/blog", changefreq: "weekly", priority: "0.6" },
    { loc: "/requests", changefreq: "daily", priority: "0.6" },
    { loc: "/requests/new", changefreq: "monthly", priority: "0.6" },
    { loc: "/mortgage-calculator", changefreq: "monthly", priority: "0.5" },
  ];

  for (const page of staticPages) {
    urls.push(`  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  }

  // 2. Location Landing Pages (Uganda Regions & Districts)
  const locations = [
    "kampala", "wakiso", "mukono", "jinja", "entebbe", "mbarara", 
    "gulu", "kira", "kasangati", "seeta", "namugongo", "kololo", 
    "naguru", "muyenga", "munyonyo", "lubowa", "bwebajja"
  ];

  for (const loc of locations) {
    urls.push(`  <url>
    <loc>${BASE_URL}/search?location=${encodeURIComponent(loc)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  // 3. Dynamic Property Listings from Seed / Dist
  try {
    // Read listings file to extract seeds or dynamic items
    const listingsFile = fs.readFileSync(path.join(rootDir, "src", "lib", "listings.ts"), "utf8");
    
    // Extract slugs if already defined or compute from seeds
    const slugMatches = [...listingsFile.matchAll(/generatePropertySlug\(\{([^}]+)\}\)/g)];
    
    // We can import the built or source module
    const { LISTINGS } = await import("../dist/server/assets/PropertyCard-odEmEQ-2.js").catch(() => ({ LISTINGS: [] }));
    
    // Fallback: parse listings titles/districts from seeds
    const seedBlocks = listingsFile.match(/const seeds: Seed\[] = \[([\s\S]*?)\];/);
    if (seedBlocks && seedBlocks[1]) {
      const items = [...seedBlocks[1].matchAll(/\[\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*([\d_]+),\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*(\d+)/g)];
      
      let counter = 0;
      for (const item of items) {
        counter++;
        const [, title, type, category, listing, price, area, district, region, beds] = item;
        const bedsPart = beds && Number(beds) > 0 ? `${beds}-bedroom-` : "";
        const typePart = (type || "property").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const listingPart = (listing || "sale").toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const locPart = (area || district || "uganda").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const slug = `${bedsPart}${typePart}-for-${listingPart}-in-${locPart}-${category.substring(0,3)}${1000 + counter}`.replace(/-+/g, "-");

        urls.push(`  <url>
    <loc>${BASE_URL}/property/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);
      }
      console.log(`Added ${counter} dynamic property listing URLs to sitemap.`);
    }
  } catch (err) {
    console.warn("Could not parse property seeds directly:", err.message);
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.join("\n")}
</urlset>
`;

  fs.writeFileSync(sitemapPath, sitemapXml, "utf8");
  console.log(`✅ Sitemap successfully written to ${sitemapPath} (${urls.length} URLs)`);
}

generateSitemap();
