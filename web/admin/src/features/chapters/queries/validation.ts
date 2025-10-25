import { z } from "zod";
import type {
  ChapterDetailDto,
  MaterialChapterSummaryDto,
  UnitDetailMaterialDto,
} from "@/external/dto/material/material.query.dto";

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

const materialSchema: z.ZodType<UnitDetailMaterialDto> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const chapterBreadcrumbItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number(),
});

const chapterDetailSchema: z.ZodType<ChapterDetailDto> = z.object({
  material: materialSchema,
  chapter: chapterSummarySchema,
  ancestors: z.array(chapterBreadcrumbItemSchema),
});

export function ensureChapterDetail(data: unknown) {
  return chapterDetailSchema.parse(data);
}
