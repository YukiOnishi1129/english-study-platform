import { MaterialEditPageTemplate } from "@/features/materials/components/server";

export default async function MaterialEditPage({
  params,
}: PageProps<"/materials/[materialId]/edit">) {
  const { materialId } = await params;
  return <MaterialEditPageTemplate materialId={materialId} />;
}
