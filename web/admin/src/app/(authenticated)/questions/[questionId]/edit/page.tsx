import { QuestionEditPageTemplate } from "@/features/questions/components/server";

export default async function QuestionEditPage({
  params,
}: PageProps<"/questions/[questionId]/edit">) {
  const { questionId } = await params;
  return <QuestionEditPageTemplate questionId={questionId} />;
}
