import { UnitEditPageTemplate } from "@/features/units/components/server";

export default async function UnitEditPage({
  params,
}: PageProps<"/units/[unitId]/edit">) {
  const { unitId } = await params;
  return <UnitEditPageTemplate unitId={unitId} />;
}
