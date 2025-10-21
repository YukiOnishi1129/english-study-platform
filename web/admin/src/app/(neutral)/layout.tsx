import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "English Study Platform - Neutral",
  description: "どなたでもアクセスできるページ",
};

export default function NeutralLayout(props: LayoutProps<"/">) {
  return <>{props.children}</>;
}
