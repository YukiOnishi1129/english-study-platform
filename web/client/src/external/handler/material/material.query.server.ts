"use server";

import "server-only";

import {
  type GetMaterialDetailRequest,
  GetMaterialDetailRequestSchema,
  type MaterialDetailDto,
  MaterialDetailSchema,
} from "@/external/dto/material/material.detail.dto";
import {
  type GetMaterialListRequest,
  GetMaterialListRequestSchema,
  type MaterialListItemDto,
  MaterialListSchema,
} from "@/external/dto/material/material.list.dto";
import { MaterialService } from "@/external/service/material/material.service";

const materialService = new MaterialService();

export async function getMaterialList(
  request?: GetMaterialListRequest,
): Promise<MaterialListItemDto[]> {
  const parsed = request
    ? GetMaterialListRequestSchema.parse(request)
    : { accountId: null };

  const dto = await materialService.getMaterialList(parsed.accountId ?? null);
  return MaterialListSchema.parse(dto);
}

export async function getMaterialDetail(
  request: GetMaterialDetailRequest,
): Promise<MaterialDetailDto> {
  const parsed = GetMaterialDetailRequestSchema.parse(request);
  const dto = await materialService.getMaterialDetail({
    materialId: parsed.materialId,
    accountId: parsed.accountId ?? null,
  });
  return MaterialDetailSchema.parse(dto);
}
