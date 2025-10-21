import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理者ログイン | English Study Admin",
  description: "English Study Platform 管理者向けログインページ",
};

export default function GuestLayout(props: LayoutProps<"/">) {
  return <>{props.children}</>;
}
