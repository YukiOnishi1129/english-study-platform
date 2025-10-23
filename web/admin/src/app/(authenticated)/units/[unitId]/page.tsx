import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUnitDetail } from "@/external/handler/material/material.query.server";
import { UnitDetailPageTemplate } from "@/features/materials/components/server";

export async function generateMetadata({
  params,
}: PageProps<"/units/[unitId]">): Promise<Metadata> {
  const { unitId } = await params;
  try {
    const detail = await getUnitDetail({ unitId });
    return {
      title: `${detail.unit.name} | ${detail.material.name} - English Study Admin`,
      description: `${detail.material.name} / ${detail.unit.name} の問題管理ページ`,
    };
  } catch {
    notFound();
  }
}

export default async function UnitDetailPage({
  params,
}: PageProps<"/units/[unitId]">) {
  const { unitId } = await params;
  return <UnitDetailPageTemplate unitId={unitId} />;
}
