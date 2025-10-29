"use server";

import { ZodError } from "zod";
import { updateQuestion } from "@/external/handler/material/material.command.server";
import { toQuestionDetailPath } from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";

export async function updateQuestionAction(
  formData: FormData,
): Promise<FormState> {
  const questionIdEntry = formData.get("questionId");
  const unitIdEntry = formData.get("unitId");
  const japaneseEntry = formData.get("japanese");
  const promptEntry = formData.get("prompt");
  const hintEntry = formData.get("hint");
  const explanationEntry = formData.get("explanation");
  const orderEntry = formData.get("order");
  const correctAnswersEntries = formData.getAll("correctAnswers");
  const vocabularyEntryIdEntry = formData.get("vocabularyEntryId");
  const headwordEntry = formData.get("headword");
  const partOfSpeechEntry = formData.get("partOfSpeech");
  const pronunciationEntry = formData.get("pronunciation");
  const vocabularyMemoEntry = formData.get("vocabularyMemo");
  const synonymsEntry = formData.get("synonyms");
  const antonymsEntry = formData.get("antonyms");
  const relatedWordsEntry = formData.get("relatedWords");
  const exampleSentenceEnEntry = formData.get("exampleSentenceEn");
  const exampleSentenceJaEntry = formData.get("exampleSentenceJa");

  const questionId = typeof questionIdEntry === "string" ? questionIdEntry : "";
  const unitId = typeof unitIdEntry === "string" ? unitIdEntry : "";

  const japanese =
    typeof japaneseEntry === "string" ? japaneseEntry.trim() : "";
  const correctAnswers = correctAnswersEntries
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter((entry) => entry.length > 0);

  const orderNumber =
    typeof orderEntry === "string" && orderEntry.trim().length > 0
      ? Number(orderEntry)
      : undefined;

  try {
    if (!questionId || !unitId) {
      throw new Error("必要なIDが取得できませんでした。");
    }

    if (correctAnswers.length === 0) {
      throw new Error("英語正解を1件以上入力してください。");
    }

    const optionalText = (entry: FormDataEntryValue | null) =>
      typeof entry === "string" && entry.trim().length > 0
        ? entry.trim()
        : undefined;

    const parseList = (entry: FormDataEntryValue | null) =>
      typeof entry === "string"
        ? entry
            .split(/[\n,]/)
            .map((value) => value.trim())
            .filter((value) => value.length > 0)
        : [];

    const vocabularyEntryId = optionalText(vocabularyEntryIdEntry);
    const vocabularyHeadword =
      typeof headwordEntry === "string" ? headwordEntry.trim() : "";

    const detail = await updateQuestion({
      questionId,
      unitId,
      japanese,
      prompt: optionalText(promptEntry),
      hint: optionalText(hintEntry),
      explanation: optionalText(explanationEntry),
      order:
        typeof orderNumber === "number" && Number.isFinite(orderNumber)
          ? orderNumber
          : undefined,
      correctAnswers,
      vocabulary:
        vocabularyEntryId && vocabularyHeadword.length > 0
          ? {
              vocabularyEntryId,
              headword: vocabularyHeadword,
              partOfSpeech: optionalText(partOfSpeechEntry),
              pronunciation: optionalText(pronunciationEntry),
              memo: optionalText(vocabularyMemoEntry),
              synonyms: parseList(synonymsEntry),
              antonyms: parseList(antonymsEntry),
              relatedWords: parseList(relatedWordsEntry),
              exampleSentenceEn: optionalText(exampleSentenceEnEntry),
              exampleSentenceJa: optionalText(exampleSentenceJaEntry),
            }
          : undefined,
    });

    return {
      status: "success",
      redirect: toQuestionDetailPath(detail.question.id),
      message: "問題を更新しました。",
    } satisfies FormState;
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues ?? [];
      return {
        status: "error",
        message: issues[0]?.message ?? "入力内容を確認してください。",
      } satisfies FormState;
    }
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "問題の更新に失敗しました。",
    } satisfies FormState;
  }
}
