"use client";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Spinner } from "@/shared/components/ui/spinner";
import type { VocabularyCsvImporterPresenterProps } from "./types";

export function VocabularyCsvImporterPresenter(
  props: VocabularyCsvImporterPresenterProps,
) {
  const {
    unitName,
    existingQuestionCount,
    templateHref,
    parseState,
    importStatus,
    paginatedRows,
    summary,
    page,
    totalPages,
    pageSize,
    rangeStart,
    rangeEnd,
    canImport,
    isImporting,
    onFileChange,
    onImport,
    onPrevPage,
    onNextPage,
  } = props;

  return (
    <section className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              CSVで語彙を取り込む
            </h3>
            <p className="text-sm text-gray-600">
              UNIT「{unitName}
              」に紐づく語彙をCSVから一括で追加・更新します。既存の語彙を更新する場合は「語彙ID」または関連する「問題ID」を指定してください。
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href={templateHref} download="vocabulary-template.csv">
              テンプレートをダウンロード
            </a>
          </Button>
        </div>
        <Card className="bg-slate-50 px-4 py-3 text-xs text-slate-600">
          必須列: 英単語, 日本語訳1, 正解候補1。任意: 語彙ID, 問題ID, 並び順,
          日本語訳2〜, 品詞, 発音, プロンプト, 正解候補2〜,
          類義語/対義語/関連語, 例文(英/和)。
        </Card>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="sm" className="border-dashed">
          <label
            htmlFor="vocabularyCsvFile"
            className="inline-flex cursor-pointer items-center gap-2"
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
        </Button>
        <input
          id="vocabularyCsvFile"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onFileChange}
        />
        <span className="text-xs text-gray-500">
          既存の問題数: {existingQuestionCount}問
        </span>
      </div>

      {importStatus.status === "success" ? (
        <Card className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
          {importStatus.message ?? "CSVの取り込みが完了しました。"}
        </Card>
      ) : null}
      {importStatus.status === "error" ? (
        <Card className="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {importStatus.message ?? "CSVの取り込みに失敗しました。"}
        </Card>
      ) : null}

      {parseState.status === "parsing" ? (
        <Card className="border border-gray-200 bg-white p-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Spinner className="h-4 w-4 text-indigo-600" />
            <span>CSVを解析しています...</span>
          </div>
        </Card>
      ) : null}

      {parseState.status === "error" && parseState.errors.length > 0 ? (
        <Card className="border border-red-200 bg-red-50 p-4">
          <h4 className="text-sm font-semibold text-red-700">エラー</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
            {parseState.errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {parseState.status === "success" ? (
        <div className="space-y-4">
          <dl className="grid gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                CSV内の行数
              </dt>
              <dd className="mt-1 text-xl font-semibold text-gray-900">
                {summary.total}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                新規追加見込み
              </dt>
              <dd className="mt-1 text-xl font-semibold text-emerald-600">
                {summary.newCount}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                更新見込み
              </dt>
              <dd className="mt-1 text-xl font-semibold text-amber-600">
                {summary.updateCount}
              </dd>
            </div>
          </dl>

          <Card className="space-y-2 border border-indigo-100 bg-indigo-50/60 p-4 text-sm text-indigo-700">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold">
                プレビューした内容をDBへ取り込みます。
              </p>
              <Button
                type="button"
                size="sm"
                onClick={onImport}
                disabled={!canImport}
              >
                {isImporting ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4 text-white" />
                    取り込み中...
                  </span>
                ) : (
                  "取り込みを実行"
                )}
              </Button>
            </div>
            {importStatus.status === "idle" ? (
              <p className="text-xs text-indigo-600">
                実行すると既存の正解や関連語は上書きされます。内容を確認してから実行してください。
              </p>
            ) : null}
            {importStatus.status === "loading" ? (
              <div className="flex items-center gap-2 text-xs text-indigo-600">
                <Spinner className="h-3 w-3 text-indigo-500" />
                <span>取り込みを実行しています...</span>
              </div>
            ) : null}
          </Card>

          <div className="space-y-2 text-xs text-gray-600">
            <p>
              表示範囲: {rangeStart}〜{rangeEnd} 行 / 全 {summary.total} 行
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">語彙ID/問題ID</th>
                  <th className="px-4 py-3">英単語</th>
                  <th className="px-4 py-3">日本語訳</th>
                  <th className="px-4 py-3">品詞</th>
                  <th className="px-4 py-3">例文（英）</th>
                  <th className="px-4 py-3">例文（和）</th>
                  <th className="px-4 py-3">正解候補</th>
                  <th className="px-4 py-3">類義語</th>
                  <th className="px-4 py-3">対義語</th>
                  <th className="px-4 py-3">関連語</th>
                  <th className="px-4 py-3">並び順</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                {paginatedRows.map((row, index) => (
                  <tr
                    key={`${row.vocabularyId ?? row.questionId ?? "new"}-${index}`}
                    className="align-top"
                  >
                    <td className="px-4 py-3 text-xs font-semibold text-gray-500">
                      {(page - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      <div className="space-y-1">
                        {row.vocabularyId ? (
                          <div>語彙ID: {row.vocabularyId}</div>
                        ) : null}
                        {row.questionId ? (
                          <div>問題ID: {row.questionId}</div>
                        ) : null}
                        {!row.vocabularyId && !row.questionId ? (
                          <span className="text-emerald-600">新規</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      <div className="space-y-1">
                        <div>{row.headword}</div>
                        {row.pronunciation ? (
                          <div className="text-xs text-gray-500">
                            発音: {row.pronunciation}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <div className="space-y-1">
                        <div>{row.definitionJa}</div>
                        {row.definitionVariants.length > 0 ? (
                          <div className="text-xs text-gray-500">
                            {row.definitionVariants.join(" / ")}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {row.partOfSpeech ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {row.exampleSentenceEn ? (
                        <p className="whitespace-pre-wrap">
                          {row.exampleSentenceEn}
                        </p>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {row.exampleSentenceJa ? (
                        <p className="whitespace-pre-wrap">
                          {row.exampleSentenceJa}
                        </p>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      <ul className="space-y-1">
                        {row.answerCandidates.map((answer) => (
                          <li key={answer}>{answer}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {row.synonyms.length > 0
                        ? row.synonyms.map((item) => (
                            <div key={item}>{item}</div>
                          ))
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {row.antonyms.length > 0
                        ? row.antonyms.map((item) => (
                            <div key={item}>{item}</div>
                          ))
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {row.relatedWords.length > 0
                        ? row.relatedWords.map((item) => (
                            <div key={item}>{item}</div>
                          ))
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {row.order ?? "(自動)"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-end gap-3 text-xs text-gray-600">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onPrevPage}
                disabled={page <= 1}
              >
                前へ
              </Button>
              <span>
                {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onNextPage}
                disabled={page >= totalPages}
              >
                次へ
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
