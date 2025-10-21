import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/features/auth/servers/auth-check.server";
import { GuestLayoutWrapper } from "@/shared/components/layout/server/GuestLayoutWrapper";

export const metadata: Metadata = {
  title: "English Study Platform - Admin Login",
  description: "管理者向けログインページ",
};

export default async function GuestLayout(props: LayoutProps<"/">) {
  const account = await getAuthenticatedAdmin();
  if (account) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <GuestLayoutWrapper>{props.children}</GuestLayoutWrapper>
      </div>
    </div>
  );
}
