import "server-only";

import {
  ChapterRepositoryImpl,
  CorrectAnswerRepositoryImpl,
  MaterialRepositoryImpl,
  QuestionRepositoryImpl,
  UnitRepositoryImpl,
} from "@acme/shared/db";
import { z } from "zod";
import type { UnitDetailDto } from "@/external/dto/unit/unit.query.dto";
import { UnitDetailSchema } from "@/external/dto/unit/unit.query.dto";

const unitRepository = new UnitRepositoryImpl();
const chapterRepository = new ChapterRepositoryImpl();
const materialRepository = new MaterialRepositoryImpl();
const questionRepository = new QuestionRepositoryImpl();
const correctAnswerRepository = new CorrectAnswerRepositoryImpl();

const RequestSchema = z.object({
  unitId: z.string().min(1, "unitId is required"),
});

function serialize(date: Date) {
  return date.toISOString();
}

async function buildChapterPath(chapterId: string) {
  const path = [] as UnitDetailDto["chapterPath"];
  let current = await chapterRepository.findById(chapterId);

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

    current = await chapterRepository.findById(current.parentChapterId);
  }

  return path.reverse();
}

export async function getUnitDetail(request: {
  unitId: string;
}): Promise<UnitDetailDto> {
  const { unitId } = RequestSchema.parse(request);

  const unit = await unitRepository.findById(unitId);
  if (!unit) {
    throw new Error("UNIT_NOT_FOUND");
  }

  const chapter = await chapterRepository.findById(unit.chapterId);
  if (!chapter) {
    throw new Error("CHAPTER_NOT_FOUND");
  }

  const material = await materialRepository.findById(chapter.materialId);
  if (!material) {
    throw new Error("MATERIAL_NOT_FOUND");
  }

  const chapterPath = await buildChapterPath(chapter.id);

  const questions = await questionRepository.findByUnitId(unit.id);
  const questionDtos = await Promise.all(
    questions.map(async (question) => {
      const answers = await correctAnswerRepository.findByQuestionId(
        question.id,
      );

      return {
        id: question.id,
        unitId: question.unitId,
        japanese: question.japanese,
        hint: question.hint ?? null,
        explanation: question.explanation ?? null,
        order: question.order,
        createdAt: serialize(question.createdAt),
        updatedAt: serialize(question.updatedAt),
        correctAnswers: answers.map((answer) => ({
          id: answer.id,
          answerText: answer.answerText,
          order: answer.order,
          createdAt: serialize(answer.createdAt),
          updatedAt: serialize(answer.updatedAt),
        })),
      };
    }),
  );

  const dto: UnitDetailDto = {
    material: {
      id: material.id,
      name: material.name,
      description: material.description ?? null,
      order: material.order,
      createdAt: serialize(material.createdAt),
      updatedAt: serialize(material.updatedAt),
    },
    chapterPath,
    unit: {
      id: unit.id,
      chapterId: unit.chapterId,
      name: unit.name,
      description: unit.description ?? null,
      order: unit.order,
      createdAt: serialize(unit.createdAt),
      updatedAt: serialize(unit.updatedAt),
    },
    questions: questionDtos.sort((a, b) => a.order - b.order),
  };

  return UnitDetailSchema.parse(dto);
}
