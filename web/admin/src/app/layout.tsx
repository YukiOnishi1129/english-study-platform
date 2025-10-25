import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "English Study Platform - Admin",
  description: "管理画面",
};

export default function RootLayout(props: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body>
        <Providers>{props.children}</Providers>
      </body>
    </html>
  );
}
