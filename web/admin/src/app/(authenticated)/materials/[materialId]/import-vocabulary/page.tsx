import { MaterialVocabularyImportPageTemplate } from "@/features/materials/components/server";

export default async function MaterialVocabularyImportPage({
  params,
}: PageProps<"/materials/[materialId]/import-vocabulary">) {
  const { materialId } = await params;

  return <MaterialVocabularyImportPageTemplate materialId={materialId} />;
}
