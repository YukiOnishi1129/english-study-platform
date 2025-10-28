"use server";

import "server-only";

import { correctAnswers, db, questions } from "@acme/shared/db";
import { inArray } from "drizzle-orm";
import { z } from "zod";

import {
  type ReviewSessionDataDto,
  ReviewSessionDataSchema,
} from "@/external/dto/review/review.session.dto";
import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";

import { getReviewData } from "./review.query.server";

const INPUT_SCHEMA = z.object({
  materialId: z.string().min(1),
  group: z.enum(["weak", "lowAttempts", "unattempted"]),
  startQuestionId: z.string().optional(),
});

export async function getReviewSessionData(request: {
  materialId: string;
  group: "weak" | "lowAttempts" | "unattempted";
}) {
  const account = await getAuthenticatedAccount();
  if (!account) {
    throw new Error("UNAUTHORIZED");
  }

  const { materialId, group } = INPUT_SCHEMA.parse(request);

  const reviewData = await getReviewData({
    accountId: account.id,
    materialId,
  });

  const summary = reviewData.materials.find(
    (material) => material.id === reviewData.selectedMaterialId,
  );

  const groupQuestions = reviewData.groups[group];
  if (!summary || groupQuestions.length === 0) {
    return ReviewSessionDataSchema.parse({
      material: {
        id: materialId,
        name: summary?.name ?? "選択した教材",
      },
      group,
      questions: [],
    });
  }

  const questionIds = groupQuestions.map((question) => question.questionId);

  const questionDetails = await db
    .select({
      questionId: questions.id,
      hint: questions.hint,
      explanation: questions.explanation,
    })
    .from(questions)
    .where(inArray(questions.id, questionIds));

  const questionDetailMap = new Map(
    questionDetails.map((detail) => [detail.questionId, detail]),
  );

  const acceptableAnswerRows = await db
    .select({
      questionId: correctAnswers.questionId,
      answerText: correctAnswers.answerText,
      order: correctAnswers.order,
    })
    .from(correctAnswers)
    .where(inArray(correctAnswers.questionId, questionIds))
    .orderBy(correctAnswers.questionId, correctAnswers.order);

  const acceptableAnswerMap = new Map<string, string[]>();
  acceptableAnswerRows.forEach((row) => {
    const list = acceptableAnswerMap.get(row.questionId) ?? [];
    list.push(row.answerText);
    acceptableAnswerMap.set(row.questionId, list);
  });

  const questionsWithDetails = groupQuestions.map((question) => {
    const detail = questionDetailMap.get(question.questionId);
    const acceptableAnswers =
      acceptableAnswerMap.get(question.questionId) ?? [];
    return {
      ...question,
      hint: detail?.hint ?? null,
      explanation: detail?.explanation ?? null,
      acceptableAnswers,
    };
  });

  return ReviewSessionDataSchema.parse({
    material: {
      id: summary.id,
      name: summary.name,
    },
    group,
    questions: questionsWithDetails,
  }) satisfies ReviewSessionDataDto;
}
