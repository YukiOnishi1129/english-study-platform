import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { listAccounts } from "@/external/handler/account/account.query.server";
import { AccountList } from "@/features/accounts/components/client/AccountList";
import { parseAccountListSearchParams } from "@/features/accounts/lib/accountListParams";
import { accountKeys } from "@/features/accounts/queries";
import { getQueryClient } from "@/shared/lib/query-client";

interface AccountListPageTemplateProps {
  rawSearchParams: Record<string, string | string[] | undefined>;
}

export async function AccountListPageTemplate(
  props: AccountListPageTemplateProps,
) {
  const filters = parseAccountListSearchParams(props.rawSearchParams);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: accountKeys.list(filters),
    queryFn: () => listAccounts(filters),
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">アカウント管理</h1>
        <p className="text-sm text-gray-600">
          アカウントのロールや利用可否ステータスを管理し、最終ログイン状況を確認できます。
        </p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AccountList filters={filters} />
      </HydrationBoundary>
    </main>
  );
}
