import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuestionDetail } from "@/external/handler/material/material.query.server";
import { QuestionDetailPageTemplate } from "@/features/materials/components/server";

export async function generateMetadata({
  params,
}: PageProps<"/questions/[questionId]">): Promise<Metadata> {
  const { questionId } = await params;
  try {
    const detail = await getQuestionDetail({ questionId });
    return {
      title: `${detail.question.japanese} | ${detail.unit.name} - English Study Admin`,
      description: `${detail.unit.name} / 問題詳細ページ`,
    } satisfies Metadata;
  } catch {
    notFound();
  }
}

export default async function QuestionDetailPage({
  params,
}: PageProps<"/questions/[questionId]">) {
  const { questionId } = await params;
  return <QuestionDetailPageTemplate questionId={questionId} />;
}
