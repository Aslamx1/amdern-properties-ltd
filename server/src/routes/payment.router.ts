import { Router } from "express";
import {
  getPaymentStatus,
  handlePaymentCallback,
  initiatePayment,
} from "../controllers/payment.controller";
import { authenticateSupabaseToken } from "../middlewares/supabase-auth.middleware";

export const paymentRouter = Router();

paymentRouter.post("/initiate", authenticateSupabaseToken, initiatePayment);
paymentRouter.get("/status/:id", authenticateSupabaseToken, getPaymentStatus);
paymentRouter.post("/callback", handlePaymentCallback);

export default paymentRouter;
