import { Router, Request, Response } from "express";
import { upload, processImagesWebP } from "../middlewares/upload.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";

export const uploadRouter = Router();

/**
 * Uploads up to 10 photos, processes them through Sharp into progressive WebP,
 * generates thumbnails, and returns paths.
 */
uploadRouter.post(
  "/images",
  authenticateToken,
  upload.array("images", 10),
  processImagesWebP,
  (req: Request, res: Response): void => {
    try {
      const files = req.processedFiles || [];
      res.json({
        message: "Images uploaded and converted to WebP successfully",
        count: files.length,
        images: files,
      });
    } catch (error) {
      console.error("[Upload Router Error]:", error);
      res.status(500).json({ error: "Failed to upload and process images" });
    }
  }
);

export default uploadRouter;
