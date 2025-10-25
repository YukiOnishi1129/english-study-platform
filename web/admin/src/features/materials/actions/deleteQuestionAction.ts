"use server";
import { z } from "zod";
import { DeleteQuestionRequestSchema } from "@/external/dto/material/material.command.dto";
import { deleteQuestion } from "@/external/handler/material/material.command.server";
import { getQuestionDetail } from "@/external/handler/material/material.query.server";

const DeleteQuestionActionSchema = z.object({
  questionId: z.string().min(1, "questionIdが指定されていません。"),
});

type DeleteQuestionActionInput = z.infer<typeof DeleteQuestionActionSchema>;

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
    const detail = await getQuestionDetail({ questionId: payload.questionId });

    const request = DeleteQuestionRequestSchema.parse({
      questionId: payload.questionId,
      unitId: detail.unit.id,
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
