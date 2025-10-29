import {
  type MaterialDetailResult,
  type MaterialListResultItem,
  MaterialQueryRepositoryImpl,
} from "@acme/shared/db";

import type { MaterialDetailDto } from "@/external/dto/material/material.detail.dto";
import { MaterialDetailSchema } from "@/external/dto/material/material.detail.dto";
import type { MaterialListItemDto } from "@/external/dto/material/material.list.dto";
import { MaterialListSchema } from "@/external/dto/material/material.list.dto";

export class MaterialService {
  private materialQueryRepository = new MaterialQueryRepositoryImpl();

  async getMaterialList(
    accountId: string | null,
  ): Promise<MaterialListItemDto[]> {
    const rows: MaterialListResultItem[] =
      await this.materialQueryRepository.getMaterialList(accountId);

    const dto = rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      unitCount: row.unitCount,
      questionCount: row.questionCount,
      updatedAt: row.updatedAt.toISOString(),
      nextUnitId: row.nextUnitId,
    }));

    return MaterialListSchema.parse(dto);
  }

  async getMaterialDetail(options: {
    materialId: string;
    accountId?: string | null;
  }): Promise<MaterialDetailDto> {
    const result: MaterialDetailResult =
      await this.materialQueryRepository.getMaterialDetail({
        materialId: options.materialId,
        accountId: options.accountId ?? null,
      });

    const dto: MaterialDetailDto = {
      material: {
        id: result.material.id,
        name: result.material.name,
        description: result.material.description,
        totalUnits: result.material.totalUnits,
        totalQuestions: result.material.totalQuestions,
        updatedAt: result.material.updatedAt.toISOString(),
        nextUnitId: result.material.nextUnitId,
      },
      chapters: result.chapters.map((chapter) => ({
        id: chapter.id,
        name: chapter.name,
        description: chapter.description,
        level: chapter.level,
        parentChapterId: chapter.parentChapterId,
        order: chapter.order,
        unitCount: chapter.unitCount,
        questionCount: chapter.questionCount,
        units: chapter.units.map((unit) => ({
          id: unit.id,
          name: unit.name,
          description: unit.description,
          order: unit.order,
          questionCount: unit.questionCount,
          solvedQuestionCount: unit.solvedQuestionCount,
        })),
      })),
    };

    return MaterialDetailSchema.parse(dto);
  }
}
