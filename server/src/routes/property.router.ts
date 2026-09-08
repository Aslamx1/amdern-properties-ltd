import { Router } from "express";
import {
  searchProperties,
  getPropertyBySlug,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/property.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

export const propertyRouter = Router();

// Public search and retrieve endpoints
propertyRouter.get("/", searchProperties);
propertyRouter.get("/:slugOrId", getPropertyBySlug);

// Protected property management endpoints
propertyRouter.post("/", authenticateToken, createProperty);
propertyRouter.put("/:id", authenticateToken, updateProperty);
propertyRouter.delete("/:id", authenticateToken, deleteProperty);

export default propertyRouter;
