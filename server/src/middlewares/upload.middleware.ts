import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

export interface ProcessedImage {
  filename: string;
  originalName: string;
  imageUrl: string;
  webpUrl: string;
  thumbUrl: string;
  size: number;
}

declare global {
  namespace Express {
    interface Request {
      processedFiles?: ProcessedImage[];
    }
  }
}

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "../../uploads");

// Ensure upload directories exist
async function ensureUploadDirs() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(path.join(UPLOAD_DIR, "thumbs"), { recursive: true });
}
ensureUploadDirs().catch((err) => console.error("[Upload] Failed to create upload dirs:", err));

// Memory storage so sharp can process raw buffer directly
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/avif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP, and AVIF image files are allowed"));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024, // 10MB default
    files: 15,
  },
  fileFilter,
});

/**
 * Express middleware that takes files from multer and converts them
 * to compressed progressive WebP images and thumbnails using Sharp.
 */
export async function processImagesWebP(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawFiles = req.files as Express.Multer.File[] | undefined;
    const singleFile = req.file;

    const filesToProcess: Express.Multer.File[] = [];
    if (rawFiles && Array.isArray(rawFiles)) {
      filesToProcess.push(...rawFiles);
    } else if (singleFile) {
      filesToProcess.push(singleFile);
    }

    if (filesToProcess.length === 0) {
      next();
      return;
    }

    await ensureUploadDirs();

    const processed: ProcessedImage[] = [];

    for (const file of filesToProcess) {
      const hash = crypto.randomBytes(8).toString("hex");
      const baseName = `${Date.now()}-${hash}`;
      const webpName = `${baseName}.webp`;
      const thumbName = `thumb-${baseName}.webp`;

      const webpPath = path.join(UPLOAD_DIR, webpName);
      const thumbPath = path.join(UPLOAD_DIR, "thumbs", thumbName);

      // High-res optimized WebP (max 1920x1080 bounding box)
      const webpBuffer = await sharp(file.buffer)
        .rotate() // auto-orient based on EXIF
        .resize({
          width: 1920,
          height: 1080,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();

      // Thumbnail WebP (max 480x360)
      const thumbBuffer = await sharp(file.buffer)
        .rotate()
        .resize({
          width: 480,
          height: 360,
          fit: "cover",
          position: "centre",
        })
        .webp({ quality: 75, effort: 3 })
        .toBuffer();

      await fs.writeFile(webpPath, webpBuffer);
      await fs.writeFile(thumbPath, thumbBuffer);

      processed.push({
        filename: webpName,
        originalName: file.originalname,
        imageUrl: `/uploads/${webpName}`,
        webpUrl: `/uploads/${webpName}`,
        thumbUrl: `/uploads/thumbs/${thumbName}`,
        size: webpBuffer.length,
      });
    }

    req.processedFiles = processed;
    next();
  } catch (error) {
    console.error("[Sharp Upload Error]:", error);
    res.status(500).json({ error: "Failed to process and compress images into WebP" });
  }
}
