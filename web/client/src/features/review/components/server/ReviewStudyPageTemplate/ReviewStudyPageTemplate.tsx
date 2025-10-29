import { notFound } from "next/navigation";

import { getReviewSessionData } from "@/external/handler/review/review.session.query.server";
import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";
import { ReviewStudySession } from "@/features/review/components/client/ReviewStudySession";

interface ReviewStudyPageTemplateProps {
  materialId: string | null;
  group: "weak" | "lowAttempts" | "unattempted" | null;
  questionId?: string;
}

export async function ReviewStudyPageTemplate({
  materialId,
  group,
  questionId,
}: ReviewStudyPageTemplateProps) {
  const account = await getAuthenticatedAccount();
  if (!account) {
    notFound();
  }

  if (!materialId || !group) {
    notFound();
  }

  const session = await getReviewSessionData({
    materialId,
    group,
  });

  return (
    <ReviewStudySession session={session} initialQuestionId={questionId} />
  );
}
