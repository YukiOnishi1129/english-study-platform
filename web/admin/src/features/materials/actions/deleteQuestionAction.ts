"use server";
import { z } from "zod";
import { DeleteQuestionRequestSchema } from "@/external/dto/material/material.command.dto";
import { deleteQuestion } from "@/external/handler/material/material.command.server";

const DeleteQuestionActionSchema = z.object({
  questionId: z.string().min(1, "questionIdが指定されていません。"),
  unitId: z.string().min(1, "unitIdが指定されていません。"),
});

const DeleteQuestionsActionSchema = z.object({
  questionIds: z
    .array(z.string().min(1))
    .min(1, "削除対象の問題が選択されていません。"),
  unitId: z.string().min(1, "unitIdが指定されていません。"),
});

type DeleteQuestionActionInput = z.infer<typeof DeleteQuestionActionSchema>;
type DeleteQuestionsActionInput = z.infer<typeof DeleteQuestionsActionSchema>;

type DeleteQuestionActionResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function deleteQuestionAction(
  input: DeleteQuestionActionInput,
): Promise<DeleteQuestionActionResult> {
  const payload = DeleteQuestionActionSchema.parse(input);

  try {
    const request = DeleteQuestionRequestSchema.parse({
      questionId: payload.questionId,
      unitId: payload.unitId,
    });

    await deleteQuestion(request);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "問題の削除に失敗しました。",
    };
  }
}

export async function deleteQuestionsAction(
  input: DeleteQuestionsActionInput,
): Promise<DeleteQuestionActionResult> {
  const payload = DeleteQuestionsActionSchema.parse(input);

  try {
    for (const questionId of payload.questionIds) {
      const request = DeleteQuestionRequestSchema.parse({
        questionId,
        unitId: payload.unitId,
      });

      await deleteQuestion(request);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "問題の削除に失敗しました。",
    };
  }
}
