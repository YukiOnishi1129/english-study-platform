import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import type { QuestionDetailDto } from "@/external/dto/material/material.query.dto";
import { getQuestionDetail } from "@/external/handler/material/material.query.server";
import { QuestionDetailContent } from "@/features/questions/components/client/QuestionDetailContent";
import { questionKeys } from "@/features/questions/queries/keys";
import { getQueryClient } from "@/shared/lib/query-client";

export const dynamic = "force-dynamic";

interface QuestionDetailPageTemplateProps {
  questionId: string;
}

export async function QuestionDetailPageTemplate({
  questionId,
}: QuestionDetailPageTemplateProps) {
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: questionKeys.detail(questionId),
      queryFn: () => getQuestionDetail({ questionId }),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "QUESTION_NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  const detail = queryClient.getQueryData<QuestionDetailDto>(
    questionKeys.detail(questionId),
  );
  if (!detail) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QuestionDetailContent questionId={questionId} />
    </HydrationBoundary>
  );
}
