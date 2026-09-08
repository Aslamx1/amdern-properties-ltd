import { Router } from "express";
import passport from "passport";
import {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyPassword,
  handleGoogleOAuthCallback,
} from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

export const authRouter = Router();

// Standard Email/Password endpoints
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", authenticateToken, getMe);
authRouter.post("/verify-password", authenticateToken, verifyPassword);

// Crypto 15-minute token password recovery endpoints
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);

// Google OAuth 2.0 flow
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:3000"}/signin?error=oauth_failed`,
  }),
  handleGoogleOAuthCallback
);

export default authRouter;
