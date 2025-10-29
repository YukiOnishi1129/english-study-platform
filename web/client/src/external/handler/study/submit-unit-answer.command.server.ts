"use server";

import "server-only";

import {
  type SubmitUnitAnswerRequest,
  SubmitUnitAnswerRequestSchema,
  type SubmitUnitAnswerResponse,
  SubmitUnitAnswerResponseSchema,
} from "@/external/dto/study/submit-unit-answer.dto";
import { StudyService } from "@/external/service/study/study.service";
import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";

export async function submitUnitAnswerCommand(
  input: SubmitUnitAnswerRequest,
): Promise<SubmitUnitAnswerResponse> {
  const account = await getAuthenticatedAccount();
  if (!account) {
    throw new Error("UNAUTHORIZED");
  }

  const { unitId, questionId, answerText } =
    SubmitUnitAnswerRequestSchema.parse(input);
  const studyService = new StudyService();
  const result = await studyService.submitUnitAnswer({
    accountId: account.id,
    unitId,
    questionId,
    answerText,
  });

  return SubmitUnitAnswerResponseSchema.parse(result);
}
