import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { AccountResponse } from "@/external/dto/account/account.query.dto";
import {
  getAccountByEmail,
  getAccountByProvider,
} from "@/external/handler/account/account.query.server";
import { refreshGoogleTokens } from "@/external/handler/auth/token.command.server";
import type { Account } from "@/features/account/types/account";
import type { GoogleProfile } from "@/features/auth/types/next-auth";

function toFeatureAccount(
  account: AccountResponse,
  thumbnail?: string | null,
): Account {
  return {
    id: account.id,
    email: account.email,
    firstName: account.firstName,
    lastName: account.lastName,
    role: account.role,
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    thumbnail: thumbnail ?? account.thumbnail,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

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
            firstName: profile.given_name || "",
            lastName: profile.family_name || "",
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
        let existingAccount = await getAccountByProvider({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        });

        if (!existingAccount) {
          const googleProfile = profile as GoogleProfile;
          if (googleProfile.email) {
            existingAccount = await getAccountByEmail({
              email: googleProfile.email,
            });
          }

          if (!existingAccount) {
            console.log("Account not found, registration not allowed");
            return false;
          }
        }

        console.log("Existing account found:", existingAccount);

        if (existingAccount.role !== "admin") {
          console.log("Access denied: User is not an admin");
          return false;
        }

        const thumbnail = (profile as GoogleProfile)?.picture;

        user.account = toFeatureAccount(existingAccount, thumbnail);

        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user?.account) {
        token.account = user.account;
      }

      if (account) {
        token.accessToken = account.access_token ?? token.accessToken;
        token.refreshToken = account.refresh_token ?? token.refreshToken;
        token.idToken = account.id_token ?? token.idToken;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 1000 * 60 * 60;
        token.error = undefined;
        return token;
      }

      if (
        token.accessToken &&
        typeof token.accessTokenExpires === "number" &&
        token.accessTokenExpires > Date.now() + 60_000
      ) {
        return token;
      }

      if (!token.refreshToken) {
        return {
          ...token,
          accessToken: undefined,
          idToken: undefined,
          error: "RefreshTokenMissing",
        };
      }

      try {
        const refreshed = await refreshGoogleTokens(token.refreshToken);

        return {
          ...token,
          accessToken: refreshed.accessToken ?? token.accessToken,
          idToken: refreshed.idToken ?? token.idToken,
          accessTokenExpires:
            refreshed.accessTokenExpires ?? Date.now() + 1000 * 60 * 60,
          error: undefined,
        };
      } catch (error) {
        console.error("Error refreshing access token:", error);
        return {
          ...token,
          accessToken: undefined,
          idToken: undefined,
          error: "RefreshAccessTokenError",
        };
      }
    },
    async session({ session, token }) {
      if (token.account) {
        session.account = token.account as Account;
      }

      if (token.error) {
        session.error = token.error;
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
