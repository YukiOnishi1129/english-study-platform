"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import { chapterKeys } from "@/features/chapters/queries/keys";
import { importUnitQuestionsAction } from "@/features/materials/actions/importUnitQuestionsAction";
import {
  parseUnitQuestionCsv,
  type UnitQuestionCsvRow,
} from "@/features/materials/lib/parseUnitQuestionCsv";
import { materialKeys } from "@/features/materials/queries/keys";
import { unitKeys } from "@/features/units/queries/keys";
import type {
  ImportStatus,
  ParseState,
  UnitQuestionCsvImporterPresenterProps,
  UnitQuestionCsvImporterProps,
} from "./types";

const INITIAL_PARSE_STATE: ParseState = {
  status: "idle",
  rows: [],
  errors: [],
};

const INITIAL_IMPORT_STATUS: ImportStatus = { status: "idle" };

const PAGE_SIZE = 25;

const TEMPLATE_CSV = `関連ID,並び順,日本語,ヒント,解説,英語正解1,英語正解2
,1,サンプルの日本語文,ヒント例,解説例,Sample answer A,Sample answer B
`.trim();

export function useUnitQuestionCsvImporter(
  props: UnitQuestionCsvImporterProps,
): UnitQuestionCsvImporterPresenterProps {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [parseState, setParseState] = useState<ParseState>(INITIAL_PARSE_STATE);
  const [page, setPage] = useState(1);
  const [importStatus, setImportStatus] = useState<ImportStatus>(
    INITIAL_IMPORT_STATUS,
  );

  const totalPages = useMemo(() => {
    if (parseState.rows.length === 0) {
      return 1;
    }
    return Math.ceil(parseState.rows.length / PAGE_SIZE);
  }, [parseState.rows.length]);

  const paginatedRows = useMemo(() => {
    if (parseState.status !== "success") {
      return [] as UnitQuestionCsvRow[];
    }

    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, parseState.rows.length);
    return parseState.rows.slice(startIndex, endIndex);
  }, [page, parseState]);

  const summary = useMemo(() => {
    if (parseState.status !== "success") {
      return { total: 0, newCount: 0, updateCount: 0 };
    }

    const newCount = parseState.rows.filter((row) => !row.questionId).length;
    const updateCount = parseState.rows.length - newCount;
    return {
      total: parseState.rows.length,
      newCount,
      updateCount,
    };
  }, [parseState]);

  const templateHref = useMemo(
    () =>
      `data:text/csv;charset=utf-8,${encodeURIComponent(`${TEMPLATE_CSV}\n`)}`,
    [],
  );

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
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
          const result = parseUnitQuestionCsv(text);

          if (result.errors.length > 0) {
            setParseState({ status: "error", rows: [], errors: result.errors });
            setPage(1);
            setImportStatus(INITIAL_IMPORT_STATUS);
          } else {
            setParseState({ status: "success", rows: result.rows, errors: [] });
            setPage(1);
            setImportStatus(INITIAL_IMPORT_STATUS);
          }
        } catch (error) {
          setParseState({
            status: "error",
            rows: [],
            errors: [
              error instanceof Error
                ? error.message
                : "CSV解析中に予期しないエラーが発生しました。",
            ],
          });
          setPage(1);
          setImportStatus(INITIAL_IMPORT_STATUS);
        }
      };
      reader.onerror = () => {
        setParseState({
          status: "error",
          rows: [],
          errors: [
            "ファイルの読み込みに失敗しました。もう一度お試しください。",
          ],
        });
        setPage(1);
        setImportStatus(INITIAL_IMPORT_STATUS);
      };

      reader.readAsText(file, "utf-8");
    },
    [],
  );

  const mutation = useMutation({
    mutationFn: async (rows: UnitQuestionCsvRow[]) => {
      const result = await importUnitQuestionsAction({
        materialId: props.materialId,
        chapterId: props.chapterId,
        unitId: props.unitId,
        rows: rows.map((row) => ({
          relatedId: row.questionId ?? undefined,
          order:
            typeof row.order === "number" && Number.isFinite(row.order)
              ? row.order
              : undefined,
          japanese: row.japanese,
          hint: row.hint ?? undefined,
          explanation: row.explanation ?? undefined,
          correctAnswers: row.correctAnswers,
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
          queryKey: chapterKeys.detail(props.chapterId),
        }),
        queryClient.invalidateQueries({
          queryKey: unitKeys.detail(props.unitId),
        }),
      ];

      await Promise.all(invalidateTasks);

      const created = result.createdCount ?? 0;
      const updated = result.updatedCount ?? 0;
      const summaryMessage = `CSVの取り込みが完了しました。（新規 ${created} 件 / 更新 ${updated} 件）`;

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

  const handleImport = useCallback(() => {
    if (parseState.status !== "success" || parseState.rows.length === 0) {
      return;
    }

    mutation.mutate(parseState.rows);
  }, [mutation, parseState]);

  const canImport =
    parseState.status === "success" && parseState.rows.length > 0;
  const isImporting = importStatus.status === "loading" || mutation.isPending;

  const rangeStart =
    parseState.status === "success" ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd =
    parseState.status === "success"
      ? Math.min(page * PAGE_SIZE, parseState.rows.length)
      : 0;

  const handlePrevPage = () => setPage((prev) => Math.max(1, prev - 1));
  const handleNextPage = () =>
    setPage((prev) => Math.min(totalPages, prev + 1));

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
    onImport: handleImport,
    onPrevPage: handlePrevPage,
    onNextPage: handleNextPage,
  } satisfies UnitQuestionCsvImporterPresenterProps;
}
