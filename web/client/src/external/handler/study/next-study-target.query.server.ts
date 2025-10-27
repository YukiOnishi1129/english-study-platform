"use server";

import "server-only";

import {
  db,
  QuestionRepositoryImpl,
  questions,
  userAnswers,
} from "@acme/shared/db";
import { desc, eq } from "drizzle-orm";
import {
  type NextStudyTargetDto,
  NextStudyTargetSchema,
} from "@/external/dto/study/next-study-target.dto";
import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";

const questionRepository = new QuestionRepositoryImpl();

interface QuestionReference {
  unitId: string;
  questionId: string;
}

async function findFallbackQuestion(): Promise<QuestionReference | null> {
  const fallback = await db
    .select({
      questionId: questions.id,
      unitId: questions.unitId,
    })
    .from(questions)
    .orderBy(questions.createdAt)
    .limit(1);

  const row = fallback[0];
  if (!row) {
    return null;
  }
  return { unitId: row.unitId, questionId: row.questionId };
}

export async function getNextStudyTarget(): Promise<NextStudyTargetDto | null> {
  const account = await getAuthenticatedAccount();
  if (!account) {
    return null;
  }

  const latestAnswerRows = await db
    .select({
      questionId: userAnswers.questionId,
    })
    .from(userAnswers)
    .where(eq(userAnswers.userId, account.id))
    .orderBy(desc(userAnswers.answeredAt))
    .limit(1);

  const latestAnswer = latestAnswerRows[0];

  if (!latestAnswer) {
    const fallback = await findFallbackQuestion();
    return fallback ? NextStudyTargetSchema.parse(fallback) : null;
  }

  const lastQuestion = await questionRepository.findById(
    latestAnswer.questionId,
  );
  if (!lastQuestion) {
    const fallback = await findFallbackQuestion();
    return fallback ? NextStudyTargetSchema.parse(fallback) : null;
  }

  const unitQuestions = await questionRepository.findByUnitId(
    lastQuestion.unitId,
  );
  if (unitQuestions.length === 0) {
    const fallback = await findFallbackQuestion();
    return fallback ? NextStudyTargetSchema.parse(fallback) : null;
  }

  const currentIndex = unitQuestions.findIndex(
    (question) => question.id === lastQuestion.id,
  );

  const nextIndex =
    currentIndex >= 0 ? (currentIndex + 1) % unitQuestions.length : 0;

  const targetQuestion = unitQuestions[nextIndex] ?? unitQuestions[0];

  return NextStudyTargetSchema.parse({
    unitId: targetQuestion.unitId,
    questionId: targetQuestion.id,
  });
}
