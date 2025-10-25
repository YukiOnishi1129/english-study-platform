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
import {
  ensureMaterialHierarchy,
  ensureMaterialHierarchyList,
} from "@/features/materials/queries/validation";
import { ensureQuestionDetail } from "@/features/questions/queries/validation";
import { ensureUnitDetail } from "@/features/units/queries/validation";

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

function remapNotFoundError(error: unknown, code: string): never {
  if (error instanceof Error && /not found/i.test(error.message)) {
    throw new Error(code);
  }
  throw error;
}

export async function listMaterialsHierarchy(): Promise<
  MaterialHierarchyItemDto[]
> {
  const materials = await materialService.listMaterialsHierarchy();
  return ensureMaterialHierarchyList(materials);
}

export async function getMaterialHierarchyById(request: {
  materialId: string;
}): Promise<MaterialHierarchyItemDto | null> {
  const { materialId } = MaterialDetailRequestSchema.parse(request);
  const material = await materialService.getMaterialHierarchyById(materialId);
  return material ? ensureMaterialHierarchy(material) : null;
}

export async function getUnitDetail(request: {
  unitId: string;
}): Promise<UnitDetailDto> {
  const { unitId } = UnitDetailRequestSchema.parse(request);
  try {
    const detail = await materialService.getUnitDetail(unitId);
    return ensureUnitDetail(detail);
  } catch (error) {
    remapNotFoundError(error, "UNIT_NOT_FOUND");
  }
}

export async function getChapterDetail(request: {
  chapterId: string;
}): Promise<ChapterDetailDto> {
  const { chapterId } = ChapterDetailRequestSchema.parse(request);
  try {
    const detail = await materialService.getChapterDetail(chapterId);
    return ensureChapterDetail(detail);
  } catch (error) {
    remapNotFoundError(error, "CHAPTER_NOT_FOUND");
  }
}

export async function getQuestionDetail(request: {
  questionId: string;
}): Promise<QuestionDetailDto> {
  const { questionId } = QuestionDetailRequestSchema.parse(request);
  try {
    const detail = await materialService.getQuestionDetail(questionId);
    return ensureQuestionDetail(detail);
  } catch (error) {
    remapNotFoundError(error, "QUESTION_NOT_FOUND");
  }
}
