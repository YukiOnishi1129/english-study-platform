import {
  ChapterRepositoryImpl,
  CorrectAnswerRepositoryImpl,
  MaterialRepositoryImpl,
  QuestionRepositoryImpl,
  UnitRepositoryImpl,
} from "@acme/shared/db";
import type {
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

export class MaterialService {
  private readonly materialRepository = new MaterialRepositoryImpl();

  private readonly chapterRepository = new ChapterRepositoryImpl();

  private readonly unitRepository = new UnitRepositoryImpl();

  private readonly questionRepository = new QuestionRepositoryImpl();

  private readonly correctAnswerRepository = new CorrectAnswerRepositoryImpl();

  async getMaterialsHierarchy(): Promise<MaterialHierarchyItemDto[]> {
    const materialEntities = await this.materialRepository.findAll();

    const materials = await Promise.all(
      materialEntities.map(
        async (material): Promise<MaterialHierarchyItemDto> => {
          const chapters = await this.chapterRepository.findByMaterialId(
            material.id,
          );

          const chapterDtos = await Promise.all(
            chapters.map(
              async (chapter): Promise<MaterialChapterSummaryDto> => {
                const units = await this.unitRepository.findByChapterId(
                  chapter.id,
                );

                const unitDtos: MaterialUnitSummaryDto[] = units.map(
                  (unit) => ({
                    id: unit.id,
                    name: unit.name,
                    description: unit.description ?? null,
                    order: unit.order,
                    createdAt: serialize(unit.createdAt),
                    updatedAt: serialize(unit.updatedAt),
                  }),
                );

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
                  units: unitDtos,
                };
              },
            ),
          );

          return {
            id: material.id,
            name: material.name,
            description: material.description ?? null,
            order: material.order,
            createdAt: serialize(material.createdAt),
            updatedAt: serialize(material.updatedAt),
            chapters: chapterDtos.sort((a, b) => a.order - b.order),
          };
        },
      ),
    );

    return materials.sort((a, b) => a.order - b.order);
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

    const materialDto: UnitDetailMaterialDto = {
      id: material.id,
      name: material.name,
      description: material.description ?? null,
      order: material.order,
      createdAt: serialize(material.createdAt),
      updatedAt: serialize(material.updatedAt),
    };

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
