"use client";

import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type MaterialCsvHierarchy,
  type MaterialCsvRow,
  parseMaterialCsv,
} from "@/features/materials/lib/parseMaterialCsv";
import type { MaterialCsvImporterPresenterProps } from "./MaterialCsvImporterPresenter";

interface ParseState {
  status: "idle" | "parsing" | "success" | "error";
  rows: MaterialCsvRow[];
  hierarchy: MaterialCsvHierarchy[];
  errors: string[];
}

const INITIAL_STATE: ParseState = {
  status: "idle",
  rows: [],
  hierarchy: [],
  errors: [],
};

const PAGE_SIZE = 50;

function formatCounts(hierarchy: MaterialCsvHierarchy[]) {
  const materialCount = hierarchy.length;
  let chapterCount = 0;
  let unitCount = 0;
  let questionCount = 0;

  hierarchy.forEach((material) => {
    chapterCount += material.chapters.length;
    material.chapters.forEach((chapter) => {
      unitCount += chapter.units.length;
      chapter.units.forEach((unit) => {
        questionCount += unit.questions.length;
      });
    });
  });

  return { materialCount, chapterCount, unitCount, questionCount };
}

export function useMaterialCsvImporter(): MaterialCsvImporterPresenterProps {
  const [parseState, setParseState] = useState<ParseState>(INITIAL_STATE);
  const [page, setPage] = useState(1);

  const totalPages = useMemo(() => {
    if (parseState.rows.length === 0) {
      return 1;
    }
    return Math.ceil(parseState.rows.length / PAGE_SIZE);
  }, [parseState.rows.length]);

  useEffect(() => {
    if (parseState.status !== "success") {
      setPage(1);
      return;
    }

    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [parseState.status, page, totalPages]);

  const startIndex =
    parseState.status === "success" ? (page - 1) * PAGE_SIZE : 0;
  const endIndex =
    parseState.status === "success"
      ? Math.min(parseState.rows.length, startIndex + PAGE_SIZE)
      : 0;

  const paginatedRows = useMemo(() => {
    if (parseState.status !== "success") {
      return [] as MaterialCsvRow[];
    }
    return parseState.rows.slice(startIndex, endIndex);
  }, [parseState.status, parseState.rows, startIndex, endIndex]);

  const onFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setParseState(INITIAL_STATE);
      setPage(1);
      return;
    }

    setParseState((prev) => ({ ...prev, status: "parsing", errors: [] }));

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = typeof reader.result === "string" ? reader.result : "";
        const result = parseMaterialCsv(text);

        if (result.errors.length > 0) {
          setParseState({
            status: "error",
            rows: [],
            hierarchy: [],
            errors: result.errors,
          });
          setPage(1);
        } else {
          setParseState({
            status: "success",
            rows: result.rows,
            hierarchy: result.hierarchy,
            errors: [],
          });
          setPage(1);
        }
      } catch (error) {
        setParseState({
          status: "error",
          rows: [],
          hierarchy: [],
          errors: [
            error instanceof Error
              ? error.message
              : "CSVファイルの解析中に予期しないエラーが発生しました。",
          ],
        });
        setPage(1);
      }
    };
    reader.onerror = () => {
      setParseState({
        status: "error",
        rows: [],
        hierarchy: [],
        errors: ["ファイルの読み込みに失敗しました。もう一度お試しください。"],
      });
      setPage(1);
    };

    reader.readAsText(file, "utf-8");
  }, []);

  const counts = useMemo(
    () => formatCounts(parseState.hierarchy),
    [parseState.hierarchy],
  );

  return {
    status: parseState.status,
    errors: parseState.errors,
    hierarchy: parseState.hierarchy,
    paginatedRows,
    counts,
    rowsLength: parseState.rows.length,
    page,
    totalPages,
    startIndex,
    endIndex,
    canGoPrevious: page > 1,
    canGoNext: page < totalPages,
    onFileChange,
    onPreviousPage: () => setPage((prev) => Math.max(1, prev - 1)),
    onNextPage: () => setPage((prev) => Math.min(totalPages, prev + 1)),
  };
}
