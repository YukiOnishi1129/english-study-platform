"use client";

import { useMemo } from "react";

import type { DashboardMaterialCardViewModel } from "../DashboardContent";

export interface MaterialsSectionView {
  items: DashboardMaterialCardViewModel[];
  totalCount: number;
  isEmpty: boolean;
}

export function useMaterialsSection(
  items: DashboardMaterialCardViewModel[],
): MaterialsSectionView {
  return useMemo(
    () => ({
      items,
      totalCount: items.length,
      isEmpty: items.length === 0,
    }),
    [items],
  );
}
