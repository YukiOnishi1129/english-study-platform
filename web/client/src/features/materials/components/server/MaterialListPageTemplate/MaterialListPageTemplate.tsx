import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getMaterialList } from "@/external/handler/material/material.query.server";
import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";
import { MaterialListPageContent } from "@/features/materials/components/client/MaterialListPage";
import { materialKeys } from "@/features/materials/queries";
import { getQueryClient } from "@/shared/lib/query-client";

export async function MaterialListPageTemplate() {
  const account = await getAuthenticatedAccount();
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: materialKeys.list(account?.id ?? null),
    queryFn: () => getMaterialList({ accountId: account?.id ?? null }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MaterialListPageContent accountId={account?.id ?? null} />
    </HydrationBoundary>
  );
}
