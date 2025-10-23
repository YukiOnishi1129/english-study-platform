import { z } from "zod";
import type { MaterialChapterSummaryDto } from "@/external/dto/material/material.query.dto";

const materialUnitSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  questionCount: z.number(),
});

const chapterSummarySchema: z.ZodType<MaterialChapterSummaryDto> = z.lazy(() =>
  z.object({
    id: z.string(),
    materialId: z.string(),
    parentChapterId: z.string().nullable(),
    name: z.string(),
    description: z.string().nullable(),
    order: z.number(),
    level: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    units: z.array(materialUnitSummarySchema),
    children: z.array(chapterSummarySchema),
  }),
);

const materialHierarchySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  chapters: z.array(chapterSummarySchema),
});

export const materialHierarchyListSchema = z.array(materialHierarchySchema);

export function ensureMaterialHierarchyList(data: unknown) {
  return materialHierarchyListSchema.parse(data);
}
