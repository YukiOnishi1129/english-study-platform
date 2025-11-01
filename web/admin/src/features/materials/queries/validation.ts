import { z } from "zod";
import type {
  ContentTypeDto,
  MaterialChapterSummaryDto,
  MaterialHierarchyItemDto,
} from "@/external/dto/material/material.query.dto";

export const contentTypeSchema: z.ZodType<ContentTypeDto> = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
});

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

const materialHierarchySchema: z.ZodType<MaterialHierarchyItemDto> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  contentType: contentTypeSchema,
  chapters: z.array(chapterSummarySchema),
});

export const materialHierarchyListSchema = z.array(materialHierarchySchema);

export const contentTypeListSchema = z.array(contentTypeSchema);

export function ensureMaterialHierarchyList(data: unknown) {
  return materialHierarchyListSchema.parse(data);
}

export function ensureMaterialHierarchy(data: unknown) {
  return materialHierarchySchema.parse(data);
}

export function ensureContentTypeList(data: unknown) {
  return contentTypeListSchema.parse(data);
}
