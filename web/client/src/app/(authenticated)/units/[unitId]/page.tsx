import { UnitDetailPageTemplate } from "@/features/units/components/server/UnitDetailPageTemplate";

export default async function UnitDetailPage({
  params,
}: PageProps<"/units/[unitId]">) {
  const { unitId } = await params;
  return <UnitDetailPageTemplate unitId={unitId} />;
}
