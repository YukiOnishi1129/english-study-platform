import type { Metadata } from "next";
import { AuthenticatedLayoutWrapper } from "@/shared/components/layout/server/AuthenticatedLayoutWrapper";

export const metadata: Metadata = {
  title: "English Study Platform - Admin",
  description: "管理者向けダッシュボード",
};

export const dynamic = "force-dynamic";

export default function AuthenticatedLayout(props: LayoutProps<"/">) {
  return (
    <AuthenticatedLayoutWrapper>{props.children}</AuthenticatedLayoutWrapper>
  );
}
