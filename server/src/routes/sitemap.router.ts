import { Router, Request, Response } from "express";
import prisma from "../config/db";

export const sitemapRouter = Router();

const BASE_URL = process.env.CLIENT_URL || "https://amdernpropertiessmclimited.com";

/**
 * Express route dynamically generating sitemap.xml for all active properties and key landing pages
 */
sitemapRouter.get("/sitemap.xml", async (_req: Request, res: Response): Promise<void> => {
  try {
    const properties = await prisma.property.findMany({
      where: { status: "active" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    const staticRoutes = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/search", priority: "0.9", changefreq: "daily" },
      { loc: "/for-sale", priority: "0.9", changefreq: "daily" },
      { loc: "/for-rent", priority: "0.9", changefreq: "daily" },
      { loc: "/for-sale/houses", priority: "0.8", changefreq: "weekly" },
      { loc: "/for-rent/houses", priority: "0.8", changefreq: "weekly" },
      { loc: "/for-sale/flats-apartments", priority: "0.8", changefreq: "weekly" },
      { loc: "/for-rent/flats-apartments", priority: "0.8", changefreq: "weekly" },
      { loc: "/for-sale/land", priority: "0.8", changefreq: "weekly" },
      { loc: "/for-rent/commercial", priority: "0.8", changefreq: "weekly" },
      { loc: "/about", priority: "0.5", changefreq: "monthly" },
      { loc: "/contact", priority: "0.5", changefreq: "monthly" },
      { loc: "/blog", priority: "0.7", changefreq: "weekly" },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add static landing pages
    for (const route of staticRoutes) {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL.replace(/\/$/, "")}${route.loc}</loc>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Add dynamic property URLs
    for (const prop of properties) {
      const lastMod = prop.updatedAt ? new Date(prop.updatedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL.replace(/\/$/, "")}/property/${prop.slug}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml; charset=utf-8");
    res.header("Cache-Control", "public, max-age=3600, s-maxage=86400");
    res.send(xml);
  } catch (error) {
    console.error("[Sitemap Generation Error]:", error);
    res.status(500).send("Error generating sitemap");
  }
});

export default sitemapRouter;
