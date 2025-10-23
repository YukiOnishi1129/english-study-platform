import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSVインポート | English Study Admin",
  description: "教材CSVを読み込み、教材・章・Unit・問題をプレビューします。",
};

export default function MaterialsImportLayout(
  props: LayoutProps<"/materials/import">,
) {
  return <>{props.children}</>;
}
