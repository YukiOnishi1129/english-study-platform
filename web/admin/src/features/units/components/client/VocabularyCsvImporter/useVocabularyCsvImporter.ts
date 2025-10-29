"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { importVocabularyEntriesAction } from "@/features/materials/actions/importVocabularyEntriesAction";
import {
  parseVocabularyCsv,
  type VocabularyCsvRow,
} from "@/features/materials/lib/parseVocabularyCsv";
import { chapterKeys } from "@/features/chapters/queries/keys";
import { materialKeys } from "@/features/materials/queries/keys";
import { unitKeys } from "@/features/units/queries/keys";
import type {
  ImportStatus,
  ParseState,
  VocabularyCsvImporterPresenterProps,
  VocabularyCsvImporterProps,
} from "./types";

const INITIAL_PARSE_STATE: ParseState = {
  status: "idle",
  rows: [],
  errors: [],
};

const INITIAL_IMPORT_STATUS: ImportStatus = { status: "idle" };
const PAGE_SIZE = 25;

const TEMPLATE_CSV = `語彙ID,問題ID,並び順,英単語,日本語訳1,日本語訳2,品詞,発音,プロンプト,正解候補1,正解候補2,類義語1,対義語1,関連語1,例文(英),例文(和)
, ,1,accept,受け入れる,受諾する,verb,,この単語を使って英文を作成してください,accept,accept it,receive,refuse,admit,"We must accept the offer immediately.","我々はその提案をすぐに受け入れる必要がある。"`.trim();

export function useVocabularyCsvImporter(
  props: VocabularyCsvImporterProps,
): VocabularyCsvImporterPresenterProps {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [parseState, setParseState] =
    useState<ParseState>(INITIAL_PARSE_STATE);
  const [page, setPage] = useState(1);
  const [importStatus, setImportStatus] =
    useState<ImportStatus>(INITIAL_IMPORT_STATUS);

  const totalPages = useMemo(() => {
    if (parseState.status !== "success") {
      return 1;
    }
    return Math.max(1, Math.ceil(parseState.rows.length / PAGE_SIZE));
  }, [parseState]);

  const paginatedRows = useMemo(() => {
    if (parseState.status !== "success") {
      return [] as VocabularyCsvRow[];
    }
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, parseState.rows.length);
    return parseState.rows.slice(startIndex, endIndex);
  }, [page, parseState]);

  const summary = useMemo(() => {
    if (parseState.status !== "success") {
      return { total: 0, newCount: 0, updateCount: 0 };
    }
    const total = parseState.rows.length;
    const newCount = parseState.rows.filter(
      (row) => !row.vocabularyId && !row.questionId,
    ).length;
    const updateCount = total - newCount;
    return { total, newCount, updateCount };
  }, [parseState]);

  const templateHref = useMemo(
    () => `data:text/csv;charset=utf-8,${encodeURIComponent(`${TEMPLATE_CSV}\n`)}`,
    [],
  );

  const handleFileChange: VocabularyCsvImporterPresenterProps["onFileChange"] =
    useCallback((event) => {
      const file = event.target.files?.[0];
      if (!file) {
        setParseState(INITIAL_PARSE_STATE);
        setPage(1);
        setImportStatus(INITIAL_IMPORT_STATUS);
        return;
      }

      setParseState({ status: "parsing", rows: [], errors: [] });

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = typeof reader.result === "string" ? reader.result : "";
          const result = parseVocabularyCsv(text);

          if (result.errors.length > 0) {
            setParseState({
              status: "error",
              rows: [],
              errors: result.errors,
            });
            setImportStatus(INITIAL_IMPORT_STATUS);
            setPage(1);
          } else {
            setParseState({
              status: "success",
              rows: result.rows,
              errors: [],
            });
            setImportStatus(INITIAL_IMPORT_STATUS);
            setPage(1);
          }
        } catch (error) {
          setParseState({
            status: "error",
            rows: [],
            errors: [
              error instanceof Error
                ? error.message
                : "CSV解析中に予期せぬエラーが発生しました。",
            ],
          });
          setImportStatus(INITIAL_IMPORT_STATUS);
          setPage(1);
        }
      };
      reader.onerror = () => {
        setParseState({
          status: "error",
          rows: [],
          errors: ["ファイルの読み込みに失敗しました。もう一度お試しください。"],
        });
        setImportStatus(INITIAL_IMPORT_STATUS);
        setPage(1);
      };

      reader.readAsText(file, "utf-8");
    }, []);

  const mutation = useMutation({
    mutationFn: async (rows: VocabularyCsvRow[]) => {
      const result = await importVocabularyEntriesAction({
        unitId: props.unitId,
        materialId: props.materialId,
        rows: rows.map((row) => ({
          vocabularyId: row.vocabularyId,
          questionId: row.questionId,
          order: row.order,
          headword: row.headword,
          pronunciation: row.pronunciation,
          partOfSpeech: row.partOfSpeech,
          definitionJa: row.definitionJa,
          definitionVariants: row.definitionVariants,
          prompt: row.prompt,
          answerCandidates: row.answerCandidates,
          synonyms: row.synonyms,
          antonyms: row.antonyms,
          relatedWords: row.relatedWords,
          exampleSentenceEn: row.exampleSentenceEn,
          exampleSentenceJa: row.exampleSentenceJa,
        })),
      });

      if (!result.success) {
        throw new Error(result.message ?? "取り込みに失敗しました。");
      }

      return result;
    },
    onMutate: () => {
      setImportStatus({ status: "loading" });
    },
    onSuccess: async (result) => {
      const invalidateTasks = [
        queryClient.invalidateQueries({ queryKey: materialKeys.list() }),
        queryClient.invalidateQueries({
          queryKey: materialKeys.detail(props.materialId),
        }),
        queryClient.invalidateQueries({
          queryKey: unitKeys.detail(props.unitId),
        }),
      ];

      if (props.chapterId) {
        invalidateTasks.push(
          queryClient.invalidateQueries({
            queryKey: chapterKeys.detail(props.chapterId),
          }),
        );
      }

      await Promise.all(invalidateTasks);

      const summaryMessage = `CSVの取り込みが完了しました。（新規 ${
        result.createdCount ?? 0
      } 件 / 更新 ${result.updatedCount ?? 0} 件）`;

      setImportStatus({ status: "success", message: summaryMessage });
      setParseState(INITIAL_PARSE_STATE);
      setPage(1);
      router.refresh();
    },
    onError: (error) => {
      setImportStatus({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "CSVの取り込みに失敗しました。",
      });
    },
  });

  const isImporting = mutation.isPending;
  const canImport =
    parseState.status === "success" &&
    parseState.rows.length > 0 &&
    !isImporting;

  const rangeStart =
    parseState.status === "success" ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd =
    parseState.status === "success"
      ? Math.min(page * PAGE_SIZE, parseState.rows.length)
      : 0;

  return {
    unitName: props.unitName,
    existingQuestionCount: props.existingQuestionCount,
    templateHref,
    parseState,
    importStatus,
    paginatedRows,
    summary,
    page,
    totalPages,
    pageSize: PAGE_SIZE,
    rangeStart,
    rangeEnd,
    canImport,
    isImporting,
    onFileChange: handleFileChange,
    onImport: () => {
      if (parseState.status !== "success" || parseState.rows.length === 0) {
        return;
      }
      mutation.mutate(parseState.rows);
    },
    onPrevPage: () => setPage((prev) => Math.max(1, prev - 1)),
    onNextPage: () => setPage((prev) => Math.min(totalPages, prev + 1)),
  } satisfies VocabularyCsvImporterPresenterProps;
}
