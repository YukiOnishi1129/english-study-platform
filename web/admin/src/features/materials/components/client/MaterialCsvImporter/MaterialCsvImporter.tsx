"use client";

import type { ChangeEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import {
  type MaterialCsvHierarchy,
  type MaterialCsvRow,
  parseMaterialCsv,
} from "@/features/materials/lib/parseMaterialCsv";

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

export function MaterialCsvImporter() {
  const [parseState, setParseState] = useState<ParseState>(INITIAL_STATE);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        setParseState(INITIAL_STATE);
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
          } else {
            setParseState({
              status: "success",
              rows: result.rows,
              hierarchy: result.hierarchy,
              errors: [],
            });
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
        }
      };
      reader.onerror = () => {
        setParseState({
          status: "error",
          rows: [],
          hierarchy: [],
          errors: [
            "ファイルの読み込みに失敗しました。もう一度お試しください。",
          ],
        });
      };

      reader.readAsText(file, "utf-8");
    },
    [],
  );

  const counts = useMemo(
    () => formatCounts(parseState.hierarchy),
    [parseState.hierarchy],
  );

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            CSVインポート
          </h1>
          <p className="text-sm text-gray-600">
            教材・章・UNIT・問題を含むCSVファイルをアップロードすると、内容をそのままプレビュー表示します。
          </p>
        </header>

        <div className="mt-6 space-y-3">
          <label
            htmlFor="csvFile"
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-indigo-300 bg-indigo-50/70 px-4 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <title>ファイルを選択</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4-3-3m0 0-3 3m3-3v12"
              />
            </svg>
            CSVファイルを選択
          </label>
          <input
            id="csvFile"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />

          <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
            CSV形式（UTF-8）。列名: 教材名 / 章名 / UNIT名 / 日本語 /
            英語正解1-3 / ヒント / 解説
          </p>
        </div>
      </div>

      {parseState.status === "parsing" ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">CSVを解析しています...</p>
        </div>
      ) : null}

      {parseState.status === "error" && parseState.errors.length > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="text-sm font-semibold text-red-700">エラー</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
            {parseState.errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {parseState.status === "success" ? (
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800">
              インポート内容の概要
            </h2>
            <dl className="mt-4 grid gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  教材数
                </dt>
                <dd className="mt-1 text-xl font-semibold text-gray-900">
                  {counts.materialCount}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  章数
                </dt>
                <dd className="mt-1 text-xl font-semibold text-gray-900">
                  {counts.chapterCount}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  UNIT数
                </dt>
                <dd className="mt-1 text-xl font-semibold text-gray-900">
                  {counts.unitCount}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  問題数
                </dt>
                <dd className="mt-1 text-xl font-semibold text-gray-900">
                  {counts.questionCount}
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800">教材構成</h2>
            <div className="space-y-3">
              {parseState.hierarchy.map((material) => (
                <details
                  key={material.materialTitle}
                  className="rounded-md border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <summary className="cursor-pointer text-sm font-semibold text-gray-900">
                    {material.materialTitle}{" "}
                    <span className="ml-2 text-xs font-normal text-gray-600">
                      {material.chapters.length}章 /{" "}
                      {material.chapters.reduce(
                        (acc, chapter) => acc + chapter.units.length,
                        0,
                      )}
                      UNIT
                    </span>
                  </summary>
                  <div className="mt-3 space-y-2 pl-4 text-sm text-gray-700">
                    {material.chapters.map((chapter) => (
                      <div
                        key={`${material.materialTitle}-${chapter.chapterTitle}`}
                        className="space-y-1"
                      >
                        <p className="font-medium">
                          章: {chapter.chapterTitle}{" "}
                          <span className="ml-1 text-xs font-normal text-gray-500">
                            ({chapter.units.length} UNIT)
                          </span>
                        </p>
                        <ul className="space-y-1 pl-4">
                          {chapter.units.map((unit) => (
                            <li
                              key={`${material.materialTitle}-${chapter.chapterTitle}-${unit.unitTitle}`}
                              className="text-gray-600"
                            >
                              UNIT: {unit.unitTitle}{" "}
                              <span className="ml-1 text-xs text-gray-500">
                                ({unit.questions.length}問)
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-3 py-3">#</th>
                  <th className="px-4 py-3">教材名</th>
                  <th className="px-4 py-3">章名</th>
                  <th className="px-4 py-3">UNIT名</th>
                  <th className="px-4 py-3">日本語</th>
                  <th className="px-4 py-3">英語正解</th>
                  <th className="px-4 py-3">ヒント</th>
                  <th className="px-4 py-3">解説</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                {parseState.rows.map((row, rowIndex) => (
                  <tr
                    key={`${row.materialTitle}-${row.chapterTitle}-${row.unitTitle}-${row.questionJapanese}`}
                    className="align-top"
                  >
                    <td className="px-3 py-3 text-xs font-semibold text-gray-500">
                      {rowIndex + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.materialTitle}
                    </td>
                    <td className="px-4 py-3">{row.chapterTitle}</td>
                    <td className="px-4 py-3">{row.unitTitle}</td>
                    <td className="px-4 py-3 whitespace-pre-wrap">
                      {row.questionJapanese}
                    </td>
                    <td className="px-4 py-3">
                      <ul className="list-disc space-y-1 pl-5">
                        {row.correctAnswers.map((answer) => (
                          <li
                            key={`${row.materialTitle}-${row.chapterTitle}-${row.unitTitle}-${row.questionJapanese}-${answer}`}
                          >
                            {answer}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 whitespace-pre-wrap text-gray-600">
                      {row.hint ?? (
                        <span className="text-xs text-gray-400">―</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-pre-wrap text-gray-600">
                      {row.explanation ?? (
                        <span className="text-xs text-gray-400">―</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}
