import { Router } from "express";
import {
  getPaymentStatus,
  handlePaymentCallback,
  initiatePayment,
} from "../controllers/payment.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

export const paymentRouter = Router();

paymentRouter.post("/initiate", authenticateToken, initiatePayment);
paymentRouter.get("/status/:id", authenticateToken, getPaymentStatus);
paymentRouter.post("/callback", handlePaymentCallback);

export default paymentRouter;
