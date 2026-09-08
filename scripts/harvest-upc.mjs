import https from "https";
import http from "http";
import fs from "fs";
import path from "path";

const IMG_DIR = path.join(process.cwd(), "public", "upc-images");
const LISTINGS_FILE = path.join(process.cwd(), "src", "lib", "listings-from-upc.ts");

if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetch(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractJsonLdImages(html) {
  const matches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  const items = [];
  for (const m of matches) {
    try {
      const data = JSON.parse(m[1]);
      if (data["@type"] === "ItemList" && Array.isArray(data.itemListElement)) {
        for (const el of data.itemListElement) {
          if (el.image) items.push(el.image);
        }
      }
      if (data["@type"] === "RealEstateListing" && data.image) {
        items.push(data.image);
      }
    } catch {}
  }
  return [...new Set(items)];
}

async function downloadImage(url, filepath) {
  if (fs.existsSync(filepath)) return;
  const buf = await fetch(url);
  if (buf && buf.length > 1000) {
    fs.writeFileSync(filepath, buf);
    console.log("saved", path.basename(filepath));
  }
}

async function main() {
  const sitemap = await fetch("https://ugandapropertycentre.com/sitemaps/sitemap_listings_1.txt");
  const urls = sitemap.split("\n").filter((u) => u.trim().length > 0);
  console.log(`Found ${urls.length} listing URLs`);

  const listings = [];
  let count = 0;

  for (const url of urls) {
    if (count >= 989) break; // process all listings
    try {
      const html = await fetch(url);
      const images = extractJsonLdImages(html);
      const idMatch = url.match(/\/(\d+)-/);
      const id = idMatch ? idMatch[1] : String(count + 1);
      const slug = url.replace("https://ugandapropertycentre.com", "");

      listings.push({ id, slug, images: images.slice(0, 6) });
      console.log(`${count + 1}. ${id} -> ${images.length} images`);

      for (let i = 0; i < Math.min(images.length, 3); i++) {
        const ext = images[i].includes(".webp") ? ".webp" : ".jpg";
        const filepath = path.join(IMG_DIR, `${id}-${i}${ext}`);
        await downloadImage(images[i], filepath);
      }
      count++;
      await delay(1500);
    } catch (e) {
      console.error("failed", url, e.message);
    }
  }

  const lines = [
    "// Auto-generated from ugandapropertycentre.com",
    'import type { Listing } from "@/lib/listings";',
    "",
    "export const UPC_IMAGES: Record<string, string[]> = {",
  ];

  for (const l of listings) {
    const paths = l.images.map((u, i) => {
      const ext = u.includes(".webp") ? ".webp" : ".jpg";
      return `"/upc-images/${l.id}-${i}${ext}"`;
    });
    lines.push(`  "${l.id}": [${paths.join(", ")}],`);
  }
  lines.push("};");
  lines.push("");
  lines.push("export const UPC_SLUGS: Record<string, string> = {");
  for (const l of listings) {
    lines.push(`  "${l.id}": "${l.slug}",`);
  }
  lines.push("};");

  fs.writeFileSync(LISTINGS_FILE, lines.join("\n"));
  console.log("saved", LISTINGS_FILE);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
