import { MaterialDetailPageTemplate } from "@/features/materials/components/server/MaterialDetailPageTemplate";

export default async function MaterialDetailPage({
  params,
}: PageProps<"/materials/[materialId]">) {
  const { materialId } = await params;
  return <MaterialDetailPageTemplate materialId={materialId} />;
}
