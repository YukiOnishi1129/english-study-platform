import { z } from "zod";
import type {
  ChapterDetailDto,
  MaterialChapterSummaryDto,
  UnitDetailMaterialDto,
} from "@/external/dto/material/material.query.dto";
import { contentTypeSchema } from "@/features/materials/queries/validation";

const materialUnitSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  questionCount: z.number(),
  contentType: contentTypeSchema,
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
    contentType: contentTypeSchema,
  }),
);

const materialSchema: z.ZodType<UnitDetailMaterialDto> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  contentType: contentTypeSchema,
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
