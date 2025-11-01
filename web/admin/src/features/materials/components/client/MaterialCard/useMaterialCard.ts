"use client";

import { useMemo } from "react";
import type {
  MaterialChapterSummaryDto,
  MaterialHierarchyItemDto,
} from "@/external/dto/material/material.query.dto";

interface MaterialCardState {
  materialId: string;
  name: string;
  description: string | null;
  totalChapters: number;
  totalUnits: number;
  updatedAt: Date;
  contentType: MaterialHierarchyItemDto["contentType"];
}

function countChapters(chapters: MaterialChapterSummaryDto[]): number {
  return chapters.reduce(
    (total, chapter) => total + 1 + countChapters(chapter.children),
    0,
  );
}

function countUnits(chapters: MaterialChapterSummaryDto[]): number {
  return chapters.reduce(
    (total, chapter) =>
      total + chapter.units.length + countUnits(chapter.children),
    0,
  );
}

export function useMaterialCard(
  material: MaterialHierarchyItemDto,
): MaterialCardState {
  const totals = useMemo(() => {
    const totalChapters = countChapters(material.chapters);
    const totalUnits = countUnits(material.chapters);

    return {
      totalChapters,
      totalUnits,
    };
  }, [material.chapters]);

  return {
    materialId: material.id,
    name: material.name,
    description: material.description,
    totalChapters: totals.totalChapters,
    totalUnits: totals.totalUnits,
    updatedAt: new Date(material.updatedAt),
    contentType: material.contentType,
  };
}
