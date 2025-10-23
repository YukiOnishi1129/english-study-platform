import { UnitEditPageTemplate } from "@/features/materials/components/server";

export default async function UnitEditPage({
  params,
}: PageProps<"/units/[unitId]/edit">) {
  const { unitId } = await params;
  return <UnitEditPageTemplate unitId={unitId} />;
}
