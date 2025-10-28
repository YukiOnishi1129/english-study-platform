"use server";

import "server-only";

import { z } from "zod";
import { StudyService } from "@/external/service/study/study.service";
import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";

const InputSchema = z.object({
  unitId: z.string().min(1),
  questionId: z.string().min(1),
  answerText: z.string().min(1),
});

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
  const studyService = new StudyService();
  return studyService.submitUnitAnswer({
    accountId: account.id,
    unitId,
    questionId,
    answerText,
  });
}
