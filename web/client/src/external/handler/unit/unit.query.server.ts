import "server-only";

import { z } from "zod";
import type { UnitDetailDto } from "@/external/dto/unit/unit.query.dto";
import { UnitDetailSchema } from "@/external/dto/unit/unit.query.dto";
import { UnitService } from "@/external/service/unit/unit.service";

const RequestSchema = z.object({
  unitId: z.string().min(1, "unitId is required"),
  accountId: z.string().min(1).optional(),
});
export async function getUnitDetail(request: {
  unitId: string;
  accountId?: string | null;
}): Promise<UnitDetailDto> {
  const { unitId, accountId } = RequestSchema.parse(request);
  const unitService = new UnitService();
  const dto = await unitService.getUnitDetail({
    unitId,
    accountId: accountId ?? null,
  });

  return UnitDetailSchema.parse(dto);
}
