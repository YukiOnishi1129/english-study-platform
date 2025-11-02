"use client";

import { AccountDetailContentPresenter } from "./AccountDetailContentPresenter";
import { useAccountDetailContent } from "./useAccountDetailContent";

interface AccountDetailContentProps {
  accountId: string;
  currentAdminId: string;
}

export function AccountDetailContent(props: AccountDetailContentProps) {
  const state = useAccountDetailContent(props);
  return <AccountDetailContentPresenter {...state} />;
}
