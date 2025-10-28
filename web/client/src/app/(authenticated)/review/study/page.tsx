import { ReviewStudyPageTemplate } from "@/features/review/components/server/ReviewStudyPageTemplate";

export default async function Page({
  searchParams,
}: PageProps<"/review/study">) {
  const params = await searchParams;
  const materialId =
    typeof params?.materialId === "string" ? params.materialId : null;
  const groupParam = params?.group;
  const group =
    groupParam === "weak" ||
    groupParam === "lowAttempts" ||
    groupParam === "unattempted"
      ? groupParam
      : null;
  const questionId =
    typeof params?.questionId === "string" ? params.questionId : undefined;

  return (
    <ReviewStudyPageTemplate
      materialId={materialId}
      group={group}
      questionId={questionId}
    />
  );
}
