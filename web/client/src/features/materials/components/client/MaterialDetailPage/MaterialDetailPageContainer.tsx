"use client";

import { MaterialDetailPagePresenter } from "./MaterialDetailPagePresenter";
import { useMaterialDetailPage } from "./useMaterialDetailPage";

export interface MaterialDetailPageContainerProps {
  materialId: string;
  accountId: string | null;
}

export function MaterialDetailPageContent({
  materialId,
  accountId,
}: MaterialDetailPageContainerProps) {
  const state = useMaterialDetailPage({ materialId, accountId });

  return <MaterialDetailPagePresenter {...state} />;
}
