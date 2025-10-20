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
        // handlerを通じて既存のアカウントを検索
        const existingAccount = await getAccountByProvider({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        });

        // アカウントが存在しない場合はログイン拒否（新規登録は許可しない）
        if (!existingAccount) {
          console.log("Account not found, registration not allowed");
          return false;
        }

        // roleがadminでない場合はログイン拒否
        if (existingAccount.role !== "admin") {
          console.log("Access denied: User is not an admin");
          return false;
        }

        // Googleプロフィールからthumbnailを取得
        // profileはGoogleProvider使用時は画像URLを含む
        const thumbnail = (profile as GoogleProfile)?.picture;

        // ドメインオブジェクトをuserに設定
        user.account = {
          id: existingAccount.id,
          email: existingAccount.email,
          firstName: existingAccount.firstName,
          lastName: existingAccount.lastName,
          role: existingAccount.role,
          provider: existingAccount.provider,
          providerAccountId: existingAccount.providerAccountId,
          thumbnail: thumbnail,
          createdAt: existingAccount.createdAt,
          updatedAt: existingAccount.updatedAt,
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
