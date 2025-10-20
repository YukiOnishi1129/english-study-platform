import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getAccountByProvider } from "@/external/handler/account/account.query.server";
import { createOrGetAccount } from "@/external/handler/auth/auth.command.server";
import { setAuthCookies } from "@/features/auth/servers/cookie.server";
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
        const existingAccount = await getAccountByProvider(
          account.provider,
          account.providerAccountId,
        );

        // If account doesn't exist, we'll create it later in the jwt callback
        // For now, just prepare the user data
        const thumbnail = (profile as GoogleProfile)?.picture;
        const googleProfile = profile as GoogleProfile;

        if (existingAccount) {
          // Use existing account data
          user.account = {
            id: existingAccount.id,
            email: existingAccount.email,
            firstName: existingAccount.firstName,
            lastName: existingAccount.lastName,
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
        if (account.id_token && account.refresh_token) {
          await setAuthCookies(account.id_token, account.refresh_token);
        }

        // Create account if it doesn't exist
        if (user.account) {
          const accountData = await createOrGetAccount(
            user.account.provider,
            user.account.providerAccountId,
            {
              email: user.account.email,
              name: user.account.name,
              provider: user.account.provider,
              providerAccountId: user.account.providerAccountId,
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
