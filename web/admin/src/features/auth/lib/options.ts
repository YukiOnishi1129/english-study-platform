import { cookies } from "next/headers";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createOrGetAccount } from "@/external/handler/account/account.command.server";

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
    async signIn({ user, account }) {
      if (account?.provider !== "google") return false;

      try {
        // handlerを通じてアカウントを検索または作成
        if (!user.account) {
          console.error("User account is missing");
          return false;
        }

        const dbAccount = await createOrGetAccount({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          createInput: {
            email: user.account.email,
            firstName: user.account.firstName,
            lastName: user.account.lastName,
            role: user.account.role,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        });

        // ドメインオブジェクトをuserに設定（thumbnailも含めて完全なオブジェクト）
        user.account = {
          id: dbAccount.id,
          email: dbAccount.email,
          firstName: dbAccount.firstName,
          lastName: dbAccount.lastName,
          role: dbAccount.role,
          provider: dbAccount.provider,
          providerAccountId: dbAccount.providerAccountId,
          thumbnail: user.account.thumbnail,
          createdAt: dbAccount.createdAt,
          updatedAt: dbAccount.updatedAt,
        };

        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      // 初回ログイン時（signInコールバックの後）
      if (account && user) {
        // Google Identity PlatformのトークンをCookieに保存
        const cookieStore = await cookies();

        // IDトークンを保存（HTTPOnly, Secure）
        if (account.id_token) {
          cookieStore.set("id_token", account.id_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7日間
          });
        }

        // リフレッシュトークンを保存
        if (account.refresh_token) {
          cookieStore.set("refresh_token", account.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30日間
          });
        }

        // アクセストークンを保存（必要に応じて）
        if (account.access_token) {
          cookieStore.set("access_token", account.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60, // 1時間
          });
        }
      }

      if (user?.account) {
        // accountオブジェクトをtokenに保存
        token.account = user.account;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.account) {
        // JWTトークンからaccountオブジェクトをセッションに設定
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
