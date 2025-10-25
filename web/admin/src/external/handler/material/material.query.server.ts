import "server-only";

import { z } from "zod";
import type {
  ChapterDetailDto,
  MaterialHierarchyItemDto,
  QuestionDetailDto,
  UnitDetailDto,
} from "@/external/dto/material/material.query.dto";
import { MaterialService } from "@/external/service/material/material.service";
import { ensureChapterDetail } from "@/features/chapters/queries/validation";

const materialService = new MaterialService();

const UnitDetailRequestSchema = z.object({
  unitId: z.string().min(1, "unitId is required"),
});

const MaterialDetailRequestSchema = z.object({
  materialId: z.string().min(1, "materialId is required"),
});

const ChapterDetailRequestSchema = z.object({
  chapterId: z.string().min(1, "chapterId is required"),
});

const QuestionDetailRequestSchema = z.object({
  questionId: z.string().min(1, "questionId is required"),
});

export async function listMaterialsHierarchy(): Promise<
  MaterialHierarchyItemDto[]
> {
  return materialService.listMaterialsHierarchy();
}

export async function getMaterialHierarchyById(request: {
  materialId: string;
}): Promise<MaterialHierarchyItemDto | null> {
  const { materialId } = MaterialDetailRequestSchema.parse(request);
  return materialService.getMaterialHierarchyById(materialId);
}

export async function getUnitDetail(request: {
  unitId: string;
}): Promise<UnitDetailDto> {
  const { unitId } = UnitDetailRequestSchema.parse(request);
  return materialService.getUnitDetail(unitId);
}

export async function getChapterDetail(request: {
  chapterId: string;
}): Promise<ChapterDetailDto> {
  const { chapterId } = ChapterDetailRequestSchema.parse(request);
  const detail = await materialService.getChapterDetail(chapterId);
  return ensureChapterDetail(detail);
}

export async function getQuestionDetail(request: {
  questionId: string;
}): Promise<QuestionDetailDto> {
  const { questionId } = QuestionDetailRequestSchema.parse(request);
  return materialService.getQuestionDetail(questionId);
}
