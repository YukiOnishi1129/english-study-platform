"use client";

import type { MaterialHierarchyItemDto } from "@/external/dto/material/material.query.dto";
import { MaterialCardPresenter } from "./MaterialCardPresenter";
import { useMaterialCard } from "./useMaterialCard";

interface MaterialCardProps {
  material: MaterialHierarchyItemDto;
}

export function MaterialCard(props: MaterialCardProps) {
  const state = useMaterialCard(props.material);
  return <MaterialCardPresenter {...state} />;
}
