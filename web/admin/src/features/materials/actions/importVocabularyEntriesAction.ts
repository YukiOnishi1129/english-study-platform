"use server";

import { z } from "zod";
import {
  ImportVocabularyEntriesRequestSchema,
  type ImportVocabularyEntriesRequest,
} from "@/external/dto/material/material.command.dto";
import { importVocabularyEntries } from "@/external/handler/material/material.command.server";

const ImportVocabularyEntriesActionSchema =
  ImportVocabularyEntriesRequestSchema.extend({
    unitId: z.string().min(1, "unitIdが指定されていません。"),
    materialId: z.string().min(1, "materialIdが指定されていません。"),
  });

type ImportVocabularyEntriesActionInput = z.infer<
  typeof ImportVocabularyEntriesActionSchema
>;

type ImportVocabularyEntriesActionResult =
  | ({ success: true } & Awaited<ReturnType<typeof importVocabularyEntries>>)
  | { success: false; message: string };

export async function importVocabularyEntriesAction(
  input: ImportVocabularyEntriesActionInput,
): Promise<ImportVocabularyEntriesActionResult> {
  const payload = ImportVocabularyEntriesActionSchema.parse(input);

  try {
    const requestPayload: ImportVocabularyEntriesRequest = {
      unitId: payload.unitId,
      materialId: payload.materialId,
      rows: payload.rows,
    };

    const result = await importVocabularyEntries(requestPayload);
    return { success: true, ...result };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "語彙の取り込みに失敗しました。",
    };
  }
}

