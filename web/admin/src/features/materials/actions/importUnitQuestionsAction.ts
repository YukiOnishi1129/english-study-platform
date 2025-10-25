"use server";
import { z } from "zod";
import {
  type ImportUnitQuestionsRequest,
  ImportUnitQuestionsRequestSchema,
} from "@/external/dto/material/material.command.dto";
import { importUnitQuestions } from "@/external/handler/material/material.command.server";

const ImportUnitQuestionsActionSchema = ImportUnitQuestionsRequestSchema.extend(
  {
    materialId: z.string().min(1, "materialIdが指定されていません。"),
    chapterId: z.string().min(1, "chapterIdが指定されていません。"),
  },
);

type ImportUnitQuestionsActionInput = z.infer<
  typeof ImportUnitQuestionsActionSchema
>;

type ImportUnitQuestionsActionResult =
  | ({
      success: true;
    } & Awaited<ReturnType<typeof importUnitQuestions>>)
  | {
      success: false;
      message: string;
    };

export async function importUnitQuestionsAction(
  input: ImportUnitQuestionsActionInput,
): Promise<ImportUnitQuestionsActionResult> {
  const payload = ImportUnitQuestionsActionSchema.parse(input);

  try {
    const requestPayload: ImportUnitQuestionsRequest = {
      unitId: payload.unitId,
      rows: payload.rows,
    };

    const result = await importUnitQuestions(requestPayload);

    return { success: true, ...result };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "UNITの取り込みに失敗しました。",
    };
  }
}
