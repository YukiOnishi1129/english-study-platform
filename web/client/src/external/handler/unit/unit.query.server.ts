import "server-only";

import {
  type GetUnitDetailRequest,
  GetUnitDetailRequestSchema,
  type UnitDetailDto,
  UnitDetailSchema,
} from "@/external/dto/unit/unit.query.dto";
import { UnitService } from "@/external/service/unit/unit.service";

export async function getUnitDetail(
  request: GetUnitDetailRequest,
): Promise<UnitDetailDto> {
  const { unitId, accountId } = GetUnitDetailRequestSchema.parse(request);
  const unitService = new UnitService();
  const dto = await unitService.getUnitDetail({
    unitId,
    accountId: accountId ?? null,
  });

  return UnitDetailSchema.parse(dto);
}
