import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getAccountDetail } from "@/external/handler/account/account.query.server";
import { AccountDetailContent } from "@/features/accounts/components/client/AccountDetailContent";
import { accountKeys } from "@/features/accounts/queries";
import { getQueryClient } from "@/shared/lib/query-client";

interface AccountDetailPageTemplateProps {
  accountId: string;
  currentAdminId: string;
}

export async function AccountDetailPageTemplate(
  props: AccountDetailPageTemplateProps,
) {
  const { accountId, currentAdminId } = props;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: accountKeys.detail(accountId),
    queryFn: () => getAccountDetail(accountId),
  });

  const account = queryClient.getQueryData(accountKeys.detail(accountId));
  if (!account) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AccountDetailContent
          accountId={accountId}
          currentAdminId={currentAdminId}
        />
      </HydrationBoundary>
    </main>
  );
}
