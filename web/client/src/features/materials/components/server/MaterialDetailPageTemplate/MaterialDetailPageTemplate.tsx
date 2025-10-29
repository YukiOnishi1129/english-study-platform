import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";

import { getMaterialDetail } from "@/external/handler/material/material.query.server";
import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";
import { MaterialDetailPageContent } from "@/features/materials/components/client/MaterialDetailPage";
import { materialKeys } from "@/features/materials/queries";
import { getQueryClient } from "@/shared/lib/query-client";

interface MaterialDetailPageTemplateProps {
  materialId: string;
}

export async function MaterialDetailPageTemplate({
  materialId,
}: MaterialDetailPageTemplateProps) {
  const account = await getAuthenticatedAccount();
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: materialKeys.detail(materialId, account?.id ?? null),
      queryFn: () =>
        getMaterialDetail({
          materialId,
          accountId: account?.id ?? null,
        }),
    });
  } catch (_error) {
    notFound();
  }

  if (
    !queryClient.getQueryData(
      materialKeys.detail(materialId, account?.id ?? null),
    )
  ) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MaterialDetailPageContent
        materialId={materialId}
        accountId={account?.id ?? null}
      />
    </HydrationBoundary>
  );
}
