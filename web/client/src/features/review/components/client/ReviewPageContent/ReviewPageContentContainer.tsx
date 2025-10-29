"use client";

import { ReviewPageContentPresenter } from "./ReviewPageContentPresenter";
import { useReviewPageContent } from "./useReviewPageContent";

export interface ReviewPageContentContainerProps {
  accountId: string | null;
}

export function ReviewPageContent({
  accountId,
}: ReviewPageContentContainerProps) {
  const state = useReviewPageContent(accountId);

  return <ReviewPageContentPresenter {...state} />;
}
