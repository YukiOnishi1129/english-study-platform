"use client";

import type { ListAccountsRequest } from "@/external/dto/account/account.query.dto";
import { useAccountsListQuery } from "@/features/accounts/queries";
import { AccountListPresenter } from "./AccountListPresenter";

interface AccountListProps {
  filters: ListAccountsRequest;
}

export function AccountList(props: AccountListProps) {
  const { filters } = props;
  const { data, isLoading, isError, isFetching } =
    useAccountsListQuery(filters);

  return (
    <AccountListPresenter
      filters={filters}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
    />
  );
}
