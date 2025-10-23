import "server-only";

import type {
  CreateChapterRequest,
  CreateMaterialRequest,
  CreateUnitRequest,
  DeleteQuestionRequest,
  DeleteUnitRequest,
  ImportUnitQuestionsRequest,
  UpdateQuestionOrdersRequest,
  UpdateQuestionRequest,
  UpdateUnitOrdersRequest,
  UpdateUnitRequest,
} from "@/external/dto/material/material.command.dto";
import {
  CreateChapterRequestSchema,
  CreateMaterialRequestSchema,
  CreateUnitRequestSchema,
  DeleteQuestionRequestSchema,
  DeleteUnitRequestSchema,
  ImportUnitQuestionsRequestSchema,
  UpdateQuestionOrdersRequestSchema,
  UpdateQuestionRequestSchema,
  UpdateUnitOrdersRequestSchema,
  UpdateUnitRequestSchema,
} from "@/external/dto/material/material.command.dto";
import type {
  MaterialChapterSummaryDto,
  MaterialHierarchyItemDto,
  MaterialUnitSummaryDto,
} from "@/external/dto/material/material.query.dto";
import { MaterialService } from "@/external/service/material/material.service";

const materialService = new MaterialService();

export async function createMaterial(
  request: CreateMaterialRequest,
): Promise<MaterialHierarchyItemDto> {
  const payload = CreateMaterialRequestSchema.parse(request);
  return materialService.createMaterial(payload);
}

export async function createChapter(
  request: CreateChapterRequest,
): Promise<MaterialChapterSummaryDto> {
  const payload = CreateChapterRequestSchema.parse(request);
  return materialService.createChapter(payload);
}

export async function createUnit(
  request: CreateUnitRequest,
): Promise<MaterialUnitSummaryDto> {
  const payload = CreateUnitRequestSchema.parse(request);
  return materialService.createUnit(payload);
}

export async function updateUnit(
  request: UpdateUnitRequest,
): Promise<MaterialUnitSummaryDto> {
  const payload = UpdateUnitRequestSchema.parse(request);
  return materialService.updateUnit(payload);
}

export async function updateUnitOrders(
  request: UpdateUnitOrdersRequest,
): Promise<void> {
  const payload = UpdateUnitOrdersRequestSchema.parse(request);
  await materialService.updateUnitOrders(payload);
}

export async function importUnitQuestions(request: ImportUnitQuestionsRequest) {
  const payload = ImportUnitQuestionsRequestSchema.parse(request);
  return materialService.importUnitQuestions(payload);
}

export async function updateQuestion(request: UpdateQuestionRequest) {
  const payload = UpdateQuestionRequestSchema.parse(request);
  return materialService.updateQuestion(payload);
}

export async function deleteQuestion(request: DeleteQuestionRequest) {
  const payload = DeleteQuestionRequestSchema.parse(request);
  await materialService.deleteQuestion(payload);
}

export async function deleteUnit(request: DeleteUnitRequest) {
  const payload = DeleteUnitRequestSchema.parse(request);
  await materialService.deleteUnit(payload);
}

export async function updateQuestionOrders(
  request: UpdateQuestionOrdersRequest,
) {
  const payload = UpdateQuestionOrdersRequestSchema.parse(request);
  await materialService.updateQuestionOrders(payload);
}
