import { AccountDetailPageTemplate } from "@/features/accounts/components/server/AccountDetailPageTemplate";
import { requireAdmin } from "@/features/auth/servers/auth-check.server";

export default async function AccountDetailPage({
  params,
}: PageProps<"/accounts/[accountId]">) {
  const { accountId } = await params;
  const admin = await requireAdmin();

  return (
    <AccountDetailPageTemplate
      accountId={accountId}
      currentAdminId={admin.id}
    />
  );
}
