import "server-only";

import type {
  CreateChapterRequest,
  CreateMaterialRequest,
  CreateUnitRequest,
} from "@/external/dto/material/material.command.dto";
import {
  CreateChapterRequestSchema,
  CreateMaterialRequestSchema,
  CreateUnitRequestSchema,
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
