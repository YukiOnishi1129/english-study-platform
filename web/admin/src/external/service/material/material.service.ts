import {
  ChapterRepositoryImpl,
  CorrectAnswerRepositoryImpl,
  MaterialRepositoryImpl,
  QuestionRepositoryImpl,
  UnitRepositoryImpl,
} from "@acme/shared/db";
import {
  Chapter,
  CorrectAnswer,
  Material,
  Question,
  Unit,
} from "@acme/shared/domain";
import type {
  CreateChapterRequest,
  CreateMaterialRequest,
  CreateUnitRequest,
  ImportUnitQuestionsRequest,
  UpdateUnitOrdersRequest,
  UpdateUnitRequest,
} from "@/external/dto/material/material.command.dto";
import type {
  ChapterBreadcrumbItemDto,
  ChapterDetailDto,
  MaterialChapterSummaryDto,
  MaterialHierarchyItemDto,
  MaterialUnitSummaryDto,
  UnitDetailChapterDto,
  UnitDetailCorrectAnswerDto,
  UnitDetailDto,
  UnitDetailMaterialDto,
  UnitDetailQuestionDto,
  UnitDetailUnitDto,
} from "@/external/dto/material/material.query.dto";

function serialize(date: Date): string {
  return date.toISOString();
}

function mapMaterialBase(material: Material) {
  return {
    id: material.id,
    name: material.name,
    description: material.description ?? null,
    order: material.order,
    createdAt: serialize(material.createdAt),
    updatedAt: serialize(material.updatedAt),
  };
}

function mapChapterBase(
  chapter: Chapter,
): Omit<MaterialChapterSummaryDto, "units" | "children"> {
  return {
    id: chapter.id,
    materialId: chapter.materialId,
    parentChapterId: chapter.parentChapterId ?? null,
    name: chapter.name,
    description: chapter.description ?? null,
    level: chapter.level,
    order: chapter.order,
    createdAt: serialize(chapter.createdAt),
    updatedAt: serialize(chapter.updatedAt),
  };
}

function mapUnit(unit: Unit, questionCount = 0): MaterialUnitSummaryDto {
  return {
    id: unit.id,
    name: unit.name,
    description: unit.description ?? null,
    order: unit.order,
    createdAt: serialize(unit.createdAt),
    updatedAt: serialize(unit.updatedAt),
    questionCount,
  };
}

function sortChaptersRecursively(chapters: MaterialChapterSummaryDto[]): void {
  chapters.sort((a, b) => a.order - b.order);
  chapters.forEach((chapter) => {
    sortChaptersRecursively(chapter.children);
    chapter.units.sort((a, b) => a.order - b.order);
  });
}

export class MaterialService {
  private readonly materialRepository = new MaterialRepositoryImpl();

  private readonly chapterRepository = new ChapterRepositoryImpl();

  private readonly unitRepository = new UnitRepositoryImpl();

  private readonly questionRepository = new QuestionRepositoryImpl();

  private readonly correctAnswerRepository = new CorrectAnswerRepositoryImpl();

  async getMaterialsHierarchy(): Promise<MaterialHierarchyItemDto[]> {
    const materialEntities = await this.materialRepository.findAll();

    const materials = await Promise.all(
      materialEntities.map(async (materialEntity) => {
        const chapters = await this.chapterRepository.findByMaterialId(
          materialEntity.id,
        );

        const chapterMap = new Map<string, MaterialChapterSummaryDto>();
        const roots: MaterialChapterSummaryDto[] = [];

        await Promise.all(
          chapters.map(async (chapterEntity) => {
            const units = await this.unitRepository.findByChapterId(
              chapterEntity.id,
            );
            const counts = await this.questionRepository.countByUnitIds(
              units.map((unit) => unit.id),
            );
            const dto: MaterialChapterSummaryDto = {
              ...mapChapterBase(chapterEntity),
              units: units.map((unit) => mapUnit(unit, counts[unit.id] ?? 0)),
              children: [],
            };
            chapterMap.set(dto.id, dto);
          }),
        );

        chapterMap.forEach((chapter) => {
          if (chapter.parentChapterId) {
            const parent = chapterMap.get(chapter.parentChapterId);
            if (parent) {
              parent.children.push(chapter);
              return;
            }
          }
          roots.push(chapter);
        });

        sortChaptersRecursively(roots);

        return {
          ...mapMaterialBase(materialEntity),
          chapters: roots,
        } satisfies MaterialHierarchyItemDto;
      }),
    );

    return materials.sort((a, b) => a.order - b.order);
  }

  async getMaterialHierarchyById(
    materialId: string,
  ): Promise<MaterialHierarchyItemDto | null> {
    const materials = await this.getMaterialsHierarchy();
    return materials.find((material) => material.id === materialId) ?? null;
  }

  async getChapterDetail(chapterId: string): Promise<ChapterDetailDto> {
    const chapterEntity = await this.chapterRepository.findById(chapterId);
    if (!chapterEntity) {
      throw new Error("Chapter not found");
    }

    const materialEntity = await this.materialRepository.findById(
      chapterEntity.materialId,
    );
    if (!materialEntity) {
      throw new Error("Material not found");
    }

    const [units, childChapters] = await Promise.all([
      this.unitRepository.findByChapterId(chapterEntity.id),
      this.chapterRepository.findByParentId(chapterEntity.id),
    ]);

    const unitCounts = await this.questionRepository.countByUnitIds(
      units.map((unit) => unit.id),
    );

    const chapterDto: MaterialChapterSummaryDto = {
      ...mapChapterBase(chapterEntity),
      units: units.map((unit) => mapUnit(unit, unitCounts[unit.id] ?? 0)),
      children: await Promise.all(
        childChapters.map(async (child) => {
          const childUnits = await this.unitRepository.findByChapterId(
            child.id,
          );
          const childCounts = await this.questionRepository.countByUnitIds(
            childUnits.map((unit) => unit.id),
          );
          return {
            ...mapChapterBase(child),
            units: childUnits.map((unit) =>
              mapUnit(unit, childCounts[unit.id] ?? 0),
            ),
            children: [],
          } satisfies MaterialChapterSummaryDto;
        }),
      ),
    } satisfies MaterialChapterSummaryDto;

    const path = await this.buildChapterPath(chapterEntity);
    const ancestors: ChapterBreadcrumbItemDto[] = path
      .filter((item) => item.id !== chapterEntity.id)
      .map((item) => ({
        id: item.id,
        name: item.name,
        level: item.level,
      }));

    return {
      material: mapMaterialBase(materialEntity),
      chapter: chapterDto,
      ancestors,
    } satisfies ChapterDetailDto;
  }

  async getUnitDetail(unitId: string): Promise<UnitDetailDto> {
    const unit = await this.unitRepository.findById(unitId);

    if (!unit) {
      throw new Error("Unit not found");
    }

    const chapter = await this.chapterRepository.findById(unit.chapterId);
    if (!chapter) {
      throw new Error("Chapter not found");
    }

    const material = await this.materialRepository.findById(chapter.materialId);
    if (!material) {
      throw new Error("Material not found");
    }

    const [chapterPath, questions] = await Promise.all([
      this.buildChapterPath(chapter),
      this.questionRepository.findByUnitId(unit.id),
    ]);

    const questionsWithAnswers: UnitDetailQuestionDto[] = await Promise.all(
      questions.map(async (question): Promise<UnitDetailQuestionDto> => {
        const answers = await this.correctAnswerRepository.findByQuestionId(
          question.id,
        );
        const answerDtos: UnitDetailCorrectAnswerDto[] = answers
          .map((answer) => ({
            id: answer.id,
            answerText: answer.answerText,
            order: answer.order,
            createdAt: serialize(answer.createdAt),
            updatedAt: serialize(answer.updatedAt),
          }))
          .sort((a, b) => a.order - b.order);

        return {
          id: question.id,
          unitId: question.unitId,
          japanese: question.japanese,
          hint: question.hint ?? null,
          explanation: question.explanation ?? null,
          order: question.order,
          createdAt: serialize(question.createdAt),
          updatedAt: serialize(question.updatedAt),
          correctAnswers: answerDtos,
        };
      }),
    );

    const materialDto: UnitDetailMaterialDto = mapMaterialBase(material);
    const unitDto: UnitDetailUnitDto = {
      id: unit.id,
      chapterId: unit.chapterId,
      name: unit.name,
      description: unit.description ?? null,
      order: unit.order,
      createdAt: serialize(unit.createdAt),
      updatedAt: serialize(unit.updatedAt),
    };

    return {
      material: materialDto,
      chapterPath,
      unit: unitDto,
      questions: questionsWithAnswers.sort((a, b) => a.order - b.order),
    };
  }

  async createMaterial(
    payload: CreateMaterialRequest,
  ): Promise<MaterialHierarchyItemDto> {
    const existingMaterials = await this.materialRepository.findAll();
    const nextOrder =
      existingMaterials.length === 0
        ? 1
        : Math.max(...existingMaterials.map((material) => material.order)) + 1;

    const material = Material.create({
      name: payload.name,
      description: payload.description ?? undefined,
      order: nextOrder,
    });

    const saved = await this.materialRepository.save(material);

    return {
      ...mapMaterialBase(saved),
      chapters: [],
    };
  }

  async createChapter(
    payload: CreateChapterRequest,
  ): Promise<MaterialChapterSummaryDto> {
    const material = await this.materialRepository.findById(payload.materialId);
    if (!material) {
      throw new Error("指定された教材が見つかりません。");
    }

    let parentChapter: Chapter | null = null;
    if (payload.parentChapterId) {
      parentChapter = await this.chapterRepository.findById(
        payload.parentChapterId,
      );
      if (!parentChapter || parentChapter.materialId !== material.id) {
        throw new Error("親章が見つからないか、教材が一致しません。");
      }
    }

    const allChapters = await this.chapterRepository.findByMaterialId(
      material.id,
    );
    const siblingChapters = allChapters.filter(
      (chapter) =>
        (chapter.parentChapterId ?? null) === (payload.parentChapterId ?? null),
    );
    const nextOrder =
      siblingChapters.length === 0
        ? 1
        : Math.max(...siblingChapters.map((chapter) => chapter.order)) + 1;

    const level = parentChapter ? parentChapter.level + 1 : 0;

    const chapter = Chapter.create({
      materialId: material.id,
      parentChapterId: payload.parentChapterId ?? undefined,
      name: payload.name,
      description: payload.description ?? undefined,
      order: nextOrder,
      level,
    });

    const saved = await this.chapterRepository.save(chapter);

    return {
      ...mapChapterBase(saved),
      units: [],
      children: [],
    };
  }

  async createUnit(
    payload: CreateUnitRequest,
  ): Promise<MaterialUnitSummaryDto> {
    const chapter = await this.chapterRepository.findById(payload.chapterId);
    if (!chapter) {
      throw new Error("指定された章が見つかりません。");
    }

    const units = await this.unitRepository.findByChapterId(chapter.id);
    const nextOrder =
      units.length === 0 ? 1 : Math.max(...units.map((unit) => unit.order)) + 1;

    const unit = Unit.create({
      chapterId: chapter.id,
      name: payload.name,
      description: payload.description ?? undefined,
      order: nextOrder,
    });

    const saved = await this.unitRepository.save(unit);
    return mapUnit(saved);
  }

  async updateUnit(
    payload: UpdateUnitRequest,
  ): Promise<MaterialUnitSummaryDto> {
    const existing = await this.unitRepository.findById(payload.unitId);
    if (!existing) {
      throw new Error("指定されたUNITが見つかりません。");
    }

    const updatedUnit = new Unit({
      id: existing.id,
      chapterId: existing.chapterId,
      name: payload.name,
      description: payload.description ?? undefined,
      order: existing.order,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    const saved = await this.unitRepository.save(updatedUnit);
    return mapUnit(saved);
  }

  async updateUnitOrders(payload: UpdateUnitOrdersRequest): Promise<void> {
    const chapter = await this.chapterRepository.findById(payload.chapterId);
    if (!chapter) {
      throw new Error("指定された章が見つかりません。");
    }

    const existingUnits = await this.unitRepository.findByChapterId(chapter.id);

    if (existingUnits.length !== payload.orderedUnitIds.length) {
      throw new Error("並び替え対象のUNIT数が一致しません。");
    }

    const existingIds = new Set(existingUnits.map((unit) => unit.id));
    for (const unitId of payload.orderedUnitIds) {
      if (!existingIds.has(unitId)) {
        throw new Error("指定されたUNITが章に含まれていません。");
      }
    }

    const uniqueCheck = new Set(payload.orderedUnitIds);
    if (uniqueCheck.size !== payload.orderedUnitIds.length) {
      throw new Error("UNIT IDが重複しています。");
    }

    const updates = payload.orderedUnitIds.map((id, index) => ({
      id,
      order: index + 1,
    }));

    await this.unitRepository.updateOrders(chapter.id, updates);
  }

  async importUnitQuestions(payload: ImportUnitQuestionsRequest): Promise<{
    createdCount: number;
    updatedCount: number;
  }> {
    const unit = await this.unitRepository.findById(payload.unitId);
    if (!unit) {
      throw new Error("指定されたUNITが見つかりません。");
    }

    const existingQuestions = await this.questionRepository.findByUnitId(
      unit.id,
    );
    const existingQuestionMap = new Map(
      existingQuestions.map((question) => [question.id, question]),
    );

    const usedOrders = new Set<number>();
    let maxOrder = 0;
    existingQuestions.forEach((question) => {
      usedOrders.add(question.order);
      if (question.order > maxOrder) {
        maxOrder = question.order;
      }
    });
    let nextOrderCandidate = maxOrder + 1;
    if (nextOrderCandidate < 1) {
      nextOrderCandidate = 1;
    }

    const reserveOrder = (desired?: number): number => {
      let order =
        typeof desired === "number" && Number.isFinite(desired) && desired > 0
          ? Math.trunc(desired)
          : undefined;
      if (!order || order <= 0) {
        order = nextOrderCandidate > 0 ? nextOrderCandidate : 1;
      }

      while (usedOrders.has(order)) {
        order += 1;
      }

      usedOrders.add(order);
      if (order >= nextOrderCandidate) {
        nextOrderCandidate = order + 1;
      }

      return order;
    };

    let createdCount = 0;
    let updatedCount = 0;

    for (const row of payload.rows) {
      const answers = row.correctAnswers
        .map((answer) => answer.trim())
        .filter((answer) => answer.length > 0);

      if (answers.length === 0) {
        throw new Error("英語正解が空の行があります。");
      }

      if (row.relatedId) {
        const existing = existingQuestionMap.get(row.relatedId);
        if (!existing) {
          throw new Error(
            `関連ID「${row.relatedId}」の問題が見つかりません。先に既存の問題IDを確認してください。`,
          );
        }

        usedOrders.delete(existing.order);
        const finalOrder = reserveOrder(row.order ?? existing.order);

        const updatedQuestion = new Question({
          id: existing.id,
          unitId: existing.unitId,
          japanese: row.japanese,
          hint: row.hint ?? undefined,
          explanation: row.explanation ?? undefined,
          order: finalOrder,
          createdAt: existing.createdAt,
          updatedAt: new Date(),
        });

        await this.questionRepository.save(updatedQuestion);
        await this.correctAnswerRepository.deleteByQuestionId(existing.id);
        for (const [index, answerText] of answers.entries()) {
          const answer = CorrectAnswer.create({
            questionId: existing.id,
            answerText,
            order: index + 1,
          });
          await this.correctAnswerRepository.save(answer);
        }

        existingQuestionMap.set(existing.id, updatedQuestion);
        updatedCount += 1;
        continue;
      }

      const finalOrder = reserveOrder(row.order);
      const newQuestion = Question.create({
        unitId: unit.id,
        japanese: row.japanese,
        hint: row.hint ?? undefined,
        explanation: row.explanation ?? undefined,
        order: finalOrder,
      });

      const savedQuestion = await this.questionRepository.save(newQuestion);
      for (const [index, answerText] of answers.entries()) {
        const answer = CorrectAnswer.create({
          questionId: savedQuestion.id,
          answerText,
          order: index + 1,
        });
        await this.correctAnswerRepository.save(answer);
      }

      createdCount += 1;
    }

    return { createdCount, updatedCount };
  }

  private async buildChapterPath(
    chapter: NonNullable<
      Awaited<ReturnType<ChapterRepositoryImpl["findById"]>>
    >,
  ): Promise<UnitDetailChapterDto[]> {
    const path: UnitDetailChapterDto[] = [];
    let current = chapter;

    while (current) {
      path.push({
        id: current.id,
        materialId: current.materialId,
        parentChapterId: current.parentChapterId ?? null,
        name: current.name,
        description: current.description ?? null,
        level: current.level,
        order: current.order,
        createdAt: serialize(current.createdAt),
        updatedAt: serialize(current.updatedAt),
      });

      if (!current.parentChapterId) {
        break;
      }

      const parent = await this.chapterRepository.findById(
        current.parentChapterId,
      );
      if (!parent) {
        break;
      }
      current = parent;
    }

    return path.reverse();
  }
}
