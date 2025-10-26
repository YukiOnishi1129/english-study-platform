"use server";

import { submitUnitAnswerCommand } from "./submit-unit-answer.command.server";

export async function submitUnitAnswerAction(input: {
  unitId: string;
  questionId: string;
  answerText: string;
}) {
  return submitUnitAnswerCommand(input);
}
