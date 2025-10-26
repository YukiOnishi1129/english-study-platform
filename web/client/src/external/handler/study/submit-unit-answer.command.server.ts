"use server";

import "server-only";

import {
  CorrectAnswerRepositoryImpl,
  QuestionRepositoryImpl,
  QuestionStatisticsRepositoryImpl,
  UserAnswerRepositoryImpl,
} from "@acme/shared/db";
import { UserAnswer } from "@acme/shared/domain";
import { z } from "zod";

import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";

const questionRepository = new QuestionRepositoryImpl();
const correctAnswerRepository = new CorrectAnswerRepositoryImpl();
const userAnswerRepository = new UserAnswerRepositoryImpl();
const questionStatisticsRepository = new QuestionStatisticsRepositoryImpl();

const InputSchema = z.object({
  unitId: z.string().min(1),
  questionId: z.string().min(1),
  answerText: z.string().min(1),
});

function normalizeAnswer(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export async function submitUnitAnswerCommand(input: {
  unitId: string;
  questionId: string;
  answerText: string;
}) {
  const account = await getAuthenticatedAccount();
  if (!account) {
    throw new Error("UNAUTHORIZED");
  }

  const { unitId, questionId, answerText } = InputSchema.parse(input);

  const question = await questionRepository.findById(questionId);
  if (!question || question.unitId !== unitId) {
    throw new Error("QUESTION_NOT_FOUND");
  }

  const answers = await correctAnswerRepository.findByQuestionId(questionId);
  const normalizedAnswer = normalizeAnswer(answerText);
  const isCorrect = answers.some(
    (answer) => normalizeAnswer(answer.answerText) === normalizedAnswer,
  );

  const userAnswer = new UserAnswer({
    userId: account.id,
    questionId,
    userAnswerText: answerText,
    isCorrect,
    isManuallyMarked: false,
    answeredAt: new Date(),
  });

  await userAnswerRepository.save(userAnswer);

  const statistics = await questionStatisticsRepository.incrementCounts(
    account.id,
    questionId,
    isCorrect,
  );

  return {
    isCorrect,
    statistics: {
      totalAttempts: statistics.totalAttempts,
      correctCount: statistics.correctCount,
      incorrectCount: statistics.incorrectCount,
      accuracy: statistics.accuracy,
      lastAttemptedAt: statistics.lastAttemptedAt
        ? statistics.lastAttemptedAt.toISOString()
        : null,
    },
  };
}
