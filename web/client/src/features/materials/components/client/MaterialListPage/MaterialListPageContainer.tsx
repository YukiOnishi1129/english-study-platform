"use client";

import { MaterialListPagePresenter } from "./MaterialListPagePresenter";
import { useMaterialListPage } from "./useMaterialListPage";

export interface MaterialListPageContainerProps {
  accountId: string | null;
}

export function MaterialListPageContent({
  accountId,
}: MaterialListPageContainerProps) {
  const state = useMaterialListPage(accountId);

  return <MaterialListPagePresenter {...state} />;
}
