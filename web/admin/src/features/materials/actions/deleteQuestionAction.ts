"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DeleteQuestionRequestSchema } from "@/external/dto/material/material.command.dto";
import { deleteQuestion } from "@/external/handler/material/material.command.server";
import { getQuestionDetail } from "@/external/handler/material/material.query.server";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toQuestionDetailPath,
  toUnitDetailPath,
} from "@/features/materials/lib/paths";

const DeleteQuestionActionSchema = z.object({
  questionId: z.string().min(1, "questionIdが指定されていません。"),
});

type DeleteQuestionActionInput = z.infer<typeof DeleteQuestionActionSchema>;

type DeleteQuestionActionResult =
  | {
      success: true;
      unitId: string;
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

    revalidatePath("/materials");
    revalidatePath(toMaterialDetailPath(detail.material.id));
    if (detail.chapterPath.length > 0) {
      const lastChapter = detail.chapterPath[detail.chapterPath.length - 1];
      revalidatePath(toChapterDetailPath(lastChapter.id));
    }
    revalidatePath(toUnitDetailPath(detail.unit.id));
    revalidatePath(toQuestionDetailPath(detail.question.id));

    return { success: true, unitId: detail.unit.id };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "問題の削除に失敗しました。",
    };
  }
}
