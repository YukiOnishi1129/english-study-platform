"use client";

import type { MaterialDetailDto } from "@/external/dto/material/material.detail.dto";

import { MaterialNavigatorPresenter } from "./MaterialNavigatorPresenter";
import { useMaterialNavigator } from "./useMaterialNavigator";

export interface MaterialNavigatorContainerProps {
  chapters: MaterialDetailDto["chapters"];
}

export function MaterialNavigator({
  chapters,
}: MaterialNavigatorContainerProps) {
  const state = useMaterialNavigator(chapters);

  return <MaterialNavigatorPresenter {...state} />;
}
