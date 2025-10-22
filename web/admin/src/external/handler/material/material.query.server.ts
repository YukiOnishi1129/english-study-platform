import "server-only";

import { z } from "zod";
import type {
  MaterialHierarchyItemDto,
  UnitDetailDto,
} from "@/external/dto/material/material.query.dto";
import { MaterialService } from "@/external/service/material/material.service";

const materialService = new MaterialService();

const UnitDetailRequestSchema = z.object({
  unitId: z.string().min(1, "unitId is required"),
});

export async function getMaterialsHierarchy(): Promise<
  MaterialHierarchyItemDto[]
> {
  return materialService.getMaterialsHierarchy();
}

export async function getUnitDetail(request: {
  unitId: string;
}): Promise<UnitDetailDto> {
  const { unitId } = UnitDetailRequestSchema.parse(request);
  return materialService.getUnitDetail(unitId);
}
