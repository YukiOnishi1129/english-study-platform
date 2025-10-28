"use client";

import type { ReviewSessionDataDto } from "@/external/dto/review/review.session.dto";

import { ReviewStudySessionPresenter } from "./ReviewStudySessionPresenter";
import { useReviewStudySession } from "./useReviewStudySession";

export interface ReviewStudySessionContainerProps {
  session: ReviewSessionDataDto;
  initialQuestionId?: string;
}

export function ReviewStudySession({
  session,
  initialQuestionId,
}: ReviewStudySessionContainerProps) {
  const state = useReviewStudySession({ session, initialQuestionId });

  return <ReviewStudySessionPresenter {...state} />;
}
