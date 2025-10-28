"use server";

import "server-only";

import type { MaterialDetailDto } from "@/external/dto/material/material.detail.dto";
import { MaterialDetailSchema } from "@/external/dto/material/material.detail.dto";
import type { MaterialListItemDto } from "@/external/dto/material/material.list.dto";
import { MaterialListSchema } from "@/external/dto/material/material.list.dto";
import { MaterialService } from "@/external/service/material/material.service";

const materialService = new MaterialService();

export async function getMaterialList(options?: {
  accountId?: string | null;
}): Promise<MaterialListItemDto[]> {
  const dto = await materialService.getMaterialList(options?.accountId ?? null);
  return MaterialListSchema.parse(dto);
}

export async function getMaterialDetail(input: {
  materialId: string;
  accountId?: string | null;
}): Promise<MaterialDetailDto> {
  const dto = await materialService.getMaterialDetail({
    materialId: input.materialId,
    accountId: input.accountId ?? null,
  });
  return MaterialDetailSchema.parse(dto);
}
