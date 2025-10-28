import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getReviewData } from "@/external/handler/review/review.query.server";
import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";
import { ReviewPageContent } from "@/features/review/components/client/ReviewPageContent";
import { reviewKeys } from "@/features/review/queries";
import { getQueryClient } from "@/shared/lib/query-client";

interface ReviewPageTemplateProps {
  materialId?: string;
}

export async function ReviewPageTemplate({
  materialId,
}: ReviewPageTemplateProps) {
  const account = await getAuthenticatedAccount();
  const accountId = account?.id ?? null;
  const queryClient = getQueryClient();

  if (accountId) {
    await queryClient.prefetchQuery({
      queryKey: reviewKeys.list(accountId, materialId ?? null),
      queryFn: () =>
        getReviewData({
          accountId,
          materialId,
        }),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReviewPageContent accountId={accountId} />
    </HydrationBoundary>
  );
}
