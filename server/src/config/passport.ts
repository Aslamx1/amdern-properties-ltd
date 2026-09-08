import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./db";
import { Role } from "@prisma/client";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email returned from Google OAuth provider"), undefined);
          }

          // Check if user already exists with this googleId
          let user = await prisma.user.findFirst({
            where: {
              OR: [{ googleId: profile.id }, { email: email.toLowerCase() }],
            },
          });

          if (!user) {
            // Provision new user
            user = await prisma.user.create({
              data: {
                googleId: profile.id,
                email: email.toLowerCase(),
                name: profile.displayName || email.split("@")[0] || "User",
                avatarUrl: profile.photos?.[0]?.value || null,
                role: Role.SEEKER,
                isVerified: true,
              },
            });
          } else if (!user.googleId) {
            // Link existing account with Google ID
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId: profile.id,
                avatarUrl: user.avatarUrl || profile.photos?.[0]?.value || null,
                isVerified: true,
              },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
} else {
  console.log("[Passport] Google OAuth credentials not provided; OAuth strategy disabled.");
}

export default passport;
