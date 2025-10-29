import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getDashboardData } from "@/external/handler/dashboard/dashboard.query.server";
import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";
import { DashboardContent } from "@/features/dashboard/components/client/DashboardContent";
import { dashboardKeys } from "@/features/dashboard/queries/keys";
import { getQueryClient } from "@/shared/lib/query-client";

export async function DashboardPageTemplate() {
  const account = await getAuthenticatedAccount();

  if (!account) {
    throw new Error("Authentication error: No account found");
  }

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: dashboardKeys.all(account.id),
    queryFn: () => getDashboardData({ accountId: account.id }),
  });

  const prefetched = queryClient.getQueryData(dashboardKeys.all(account.id));
  if (!prefetched) {
    throw new Error("DASHBOARD_DATA_UNAVAILABLE");
  }

  const displayName =
    account.fullName ||
    [account.lastName, account.firstName].filter(Boolean).join(" ") ||
    account.email;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent accountId={account.id} displayName={displayName} />
    </HydrationBoundary>
  );
}
