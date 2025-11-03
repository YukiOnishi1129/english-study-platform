import { AccountListPageTemplate } from "@/features/accounts/components/server/AccountListPageTemplate";

export default async function AccountsPage({
  searchParams,
}: PageProps<"/accounts">) {
  const params = (await searchParams) as
    | Record<string, string | string[] | undefined>
    | undefined;

  return <AccountListPageTemplate rawSearchParams={params ?? {}} />;
}
