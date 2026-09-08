import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import passport from "./config/passport";
import prisma from "./config/db";
import { getAllowedOrigins } from "./config/cors";

import authRouter from "./routes/auth.router";
import propertyRouter from "./routes/property.router";
import adsRouter from "./routes/ads.router";
import sitemapRouter from "./routes/sitemap.router";
import uploadRouter from "./routes/upload.router";
import paymentRouter from "./routes/payment.router";
import privacyRouter from "./routes/privacy.router";
import adminRouter from "./routes/admin.router";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const allowedOrigins = getAllowedOrigins();

// CORS Configuration with HttpOnly cookie support
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/$/, "");
      if (
        allowedOrigins.includes(normalizedOrigin) ||
        /^(http:\/\/localhost:\d+|http:\/\/127\.0\.0\.1:\d+|http:\/\/[::1]:\d+)$/.test(normalizedOrigin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${normalizedOrigin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Initialize Passport for Google OAuth
app.use(passport.initialize());

// Serve static uploaded media files
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "../uploads");
app.use("/uploads", express.static(UPLOAD_DIR));

// Dynamic SEO Sitemap route at root level
app.use("/", sitemapRouter);

// Health check endpoint
app.get("/health", async (_req: Request, res: Response) => {
  try {
    // Quick DB ping
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "healthy", database: "connected", timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(503).json({ status: "unhealthy", database: err.message });
  }
});

// Mount API Routers
app.use("/api/auth", authRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/ads", adsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/payments", paymentRouter);

// Data Privacy & Subject Rights API (GDPR / Uganda Data Protection and Privacy Act, 2019)
app.use("/api/user/privacy", privacyRouter);

// Admin API — real dashboard metrics and moderation tools
app.use("/api/admin", adminRouter);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Centralized Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Server Unhandled Error]:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal server error",
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  Amdern Properties Backend API running on port ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/health`);
  console.log(`  Sitemap:      http://localhost:${PORT}/sitemap.xml`);
  console.log(`  Properties:   http://localhost:${PORT}/api/properties`);
  console.log(`  Ads:          http://localhost:${PORT}/api/ads`);
  console.log(`====================================================`);
});

// Graceful Shutdown
const shutdown = async () => {
  console.log("\n[Server] Gracefully shutting down...");
  server.close(async () => {
    await prisma.$disconnect();
    console.log("[Server] Prisma database connection closed.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default app;
