"use server";

import type {
  SubmitUnitAnswerRequest,
  SubmitUnitAnswerResponse,
} from "@/external/dto/study/submit-unit-answer.dto";
import { submitUnitAnswerCommand } from "./submit-unit-answer.command.server";

export async function submitUnitAnswerAction(
  input: SubmitUnitAnswerRequest,
): Promise<SubmitUnitAnswerResponse> {
  return submitUnitAnswerCommand(input);
}
