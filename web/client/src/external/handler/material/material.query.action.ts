"use server";

import {
  GetMaterialDetailRequestSchema,
  type MaterialDetailDto,
} from "@/external/dto/material/material.detail.dto";
import {
  GetMaterialListRequestSchema,
  type MaterialListItemDto,
} from "@/external/dto/material/material.list.dto";
import { getMaterialDetail, getMaterialList } from "./material.query.server";

export async function getMaterialListAction(
  accountId?: string | null,
): Promise<MaterialListItemDto[]> {
  try {
    const request = GetMaterialListRequestSchema.parse({
      accountId: accountId ?? null,
    });
    return await getMaterialList(request);
  } catch (error) {
    console.error("Failed to fetch material list", error);
    return [];
  }
}

export async function getMaterialDetailAction(input: {
  materialId: string;
  accountId?: string | null;
}): Promise<MaterialDetailDto | null> {
  try {
    const request = GetMaterialDetailRequestSchema.parse({
      materialId: input.materialId,
      accountId: input.accountId ?? null,
    });
    return await getMaterialDetail(request);
  } catch (error) {
    console.error("Failed to fetch material detail", error);
    return null;
  }
}
