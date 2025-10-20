import { cookies } from "next/headers";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getAccountByProvider } from "@/external/handler/account/account.query.server";
import type { GoogleProfile } from "@/features/auth/types/next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: "openid email profile",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          account: {
            id: profile.sub,
            email: profile.email,
            name: `${profile.given_name || ""} ${profile.family_name || ""}`.trim(),
            role: "user" as const,
            provider: "google",
            providerAccountId: profile.sub,
            thumbnail: profile.picture,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }): Promise<boolean> {
      if (account?.provider !== "google") return false;

      try {
        // Check if the account already exists
        const existingAccount = await getAccountByProvider({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        });

        // If account doesn't exist, we'll create it later in the jwt callback
        // For now, just prepare the user data
        const thumbnail = (profile as GoogleProfile)?.picture;
        const googleProfile = profile as GoogleProfile;

        if (existingAccount) {
          // Use existing account data
          user.account = {
            id: existingAccount.id,
            email: existingAccount.email,
            name: existingAccount.name,
            role: existingAccount.role,
            provider: existingAccount.provider,
            providerAccountId: existingAccount.providerAccountId,
            thumbnail: thumbnail || existingAccount.thumbnail,
            createdAt: existingAccount.createdAt,
            updatedAt: existingAccount.updatedAt,
          };
        } else {
          // Prepare data for new account
          user.account = {
            id: account.providerAccountId,
            email: googleProfile.email,
            name:
              `${googleProfile.given_name || ""} ${googleProfile.family_name || ""}`.trim() ||
              googleProfile.name,
            role: "user",
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            thumbnail: thumbnail,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }

        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      // First login (after signIn callback)
      if (account && user) {
        // Save Google Identity Platform tokens to cookies
        const cookieStore = await cookies();

        // Save ID token (HTTPOnly, Secure)
        if (account.id_token) {
          cookieStore.set("id_token", account.id_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });
        }

        // Save refresh token
        if (account.refresh_token) {
          cookieStore.set("refresh_token", account.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 days
          });
        }

        // Create account if it doesn't exist
        if (user.account) {
          const { createOrGetAccount } = await import(
            "@/external/handler/auth/auth.command.server"
          );

          const accountData = await createOrGetAccount(
            user.account.provider,
            user.account.providerAccountId,
            {
              email: user.account.email,
              name: user.account.name,
              role: "user",
              thumbnail: user.account.thumbnail,
            },
          );

          user.account = {
            ...accountData,
            createdAt: accountData.createdAt,
            updatedAt: accountData.updatedAt,
          };
        }
      }

      if (user?.account) {
        // Save account object to token
        token.account = user.account;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.account) {
        // Set account object from JWT token to session
        session.account = token.account;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
