import { ReviewPageTemplate } from "@/features/review/components/server/ReviewPageTemplate";

export default async function Page({ searchParams }: PageProps<"/review">) {
  const params = await searchParams;
  const materialId =
    typeof params?.materialId === "string" ? params.materialId : undefined;

  return <ReviewPageTemplate materialId={materialId} />;
}
