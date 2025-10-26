import { UnitStudyPageTemplate } from "@/features/study/components/server/UnitStudyPageTemplate";

export default async function UnitStudyPage({
  params,
}: PageProps<"/units/[unitId]/study">) {
  const { unitId } = await params;
  return <UnitStudyPageTemplate unitId={unitId} />;
}
