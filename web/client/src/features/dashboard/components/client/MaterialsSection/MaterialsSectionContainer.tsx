"use client";

import type { DashboardMaterialCardViewModel } from "../DashboardContent";
import { MaterialsSectionPresenter } from "./MaterialsSectionPresenter";
import { useMaterialsSection } from "./useMaterialsSection";

export interface MaterialsSectionProps {
  items: DashboardMaterialCardViewModel[];
}

export function MaterialsSection({ items }: MaterialsSectionProps) {
  const view = useMaterialsSection(items);

  return <MaterialsSectionPresenter view={view} />;
}
