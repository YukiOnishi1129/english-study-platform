"use client";

import type { ComponentProps } from "react";
import { AccountListFiltersPresenter } from "./AccountListFiltersPresenter";

export type AccountListFiltersProps = ComponentProps<
  typeof AccountListFiltersPresenter
>;

export function AccountListFilters(props: AccountListFiltersProps) {
  return <AccountListFiltersPresenter {...props} />;
}
