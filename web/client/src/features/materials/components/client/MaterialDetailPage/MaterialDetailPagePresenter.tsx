"use client";

import type { MaterialDetailDto } from "@/external/dto/material/material.detail.dto";
import { MaterialBreadcrumb } from "./components/MaterialBreadcrumb";
import { MaterialDetailError } from "./components/MaterialDetailError";
import { MaterialDetailLoading } from "./components/MaterialDetailLoading";
import { MaterialStructureSection } from "./components/MaterialStructureSection";
import { MaterialSummaryCard } from "./components/MaterialSummaryCard";

export interface MaterialDetailPagePresenterProps {
  material: MaterialDetailDto["material"] | null;
  chapters: MaterialDetailDto["chapters"];
  isLoading: boolean;
  isError: boolean;
}

export function MaterialDetailPagePresenter({
  material,
  chapters,
  isLoading,
  isError,
}: MaterialDetailPagePresenterProps) {
  if (isLoading) {
    return <MaterialDetailLoading />;
  }

  if (isError || !material) {
    return <MaterialDetailError />;
  }

  return (
    <div className="space-y-8">
      <MaterialBreadcrumb materialName={material.name} />
      <MaterialSummaryCard material={material} />
      <MaterialStructureSection chapters={chapters} />
    </div>
  );
}
