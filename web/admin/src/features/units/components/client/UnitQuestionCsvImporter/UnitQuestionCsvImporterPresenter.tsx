"use client";

import type { UnitQuestionCsvImporterPresenterProps } from "./types";

export function UnitQuestionCsvImporterPresenter(
  props: UnitQuestionCsvImporterPresenterProps,
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
              CSVで問題を取り込む
            </h3>
            <p className="text-sm text-gray-600">
              UNIT「{unitName}
              」の問題をCSVから一括で追加・更新します。既存の問題を更新する場合は「関連ID」（旧:
              問題ID）を入力してください。
            </p>
          </div>
          <a
            href={templateHref}
            download="unit-question-template.csv"
            className="inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
          >
            テンプレートをダウンロード
          </a>
        </div>
        <div className="rounded-md bg-slate-50 px-4 py-3 text-xs text-slate-600">
          必須列: 日本語, 英語正解1。任意: 関連ID, 並び順, 注釈, ヒント, 解説,
          英語正解2〜。 英語正解の列は `英語正解1`, `英語正解2`, ...
          と連番で追加してください。関連IDを空欄にすると新規追加として扱われます。
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor="unitCsvFile"
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-indigo-300 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
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
          id="unitCsvFile"
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
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
          {importStatus.message ?? "CSVの取り込みが完了しました。"}
        </div>
      ) : null}
      {importStatus.status === "error" ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {importStatus.message ?? "CSVの取り込みに失敗しました。"}
        </div>
      ) : null}

      {parseState.status === "parsing" ? (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
          CSVを解析しています...
        </div>
      ) : null}

      {parseState.status === "error" && parseState.errors.length > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h4 className="text-sm font-semibold text-red-700">エラー</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
            {parseState.errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {parseState.status === "success" ? (
        <div className="space-y-4">
          {/* Summary cards */}
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

          {/* Import action */}
          <div className="space-y-2 rounded-lg border border-indigo-100 bg-indigo-50/60 p-4 text-sm text-indigo-700">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold">
                プレビューした内容をDBへ取り込みます。
              </p>
              <button
                type="button"
                onClick={onImport}
                disabled={!canImport || isImporting}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {isImporting ? "取り込み中..." : "取り込みを実行"}
              </button>
            </div>
            {importStatus.status === "idle" ? (
              <p className="text-xs text-indigo-600">
                実行すると既存の正解は上書きされます。内容を確認してから実行してください。
              </p>
            ) : null}
            {importStatus.status === "loading" ? (
              <p className="text-xs text-indigo-600">
                取り込みを実行しています...
              </p>
            ) : null}
          </div>

          {/* Preview table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">関連ID</th>
                  <th className="px-4 py-3">日本語</th>
                  <th className="px-4 py-3">注釈</th>
                  <th className="px-4 py-3">英語例文</th>
                  <th className="px-4 py-3">英語正解</th>
                  <th className="px-4 py-3">ヒント</th>
                  <th className="px-4 py-3">解説</th>
                  <th className="px-4 py-3">音声URL</th>
                  <th className="px-4 py-3">並び順</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                {paginatedRows.map((row, index) => (
                  <tr
                    key={`${row.questionId ?? "new"}-${index}`}
                    className="align-top"
                  >
                    <td className="px-4 py-3 text-xs font-semibold text-gray-500">
                      {(page - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {row.questionId ?? (
                        <span className="text-gray-400">新規</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-pre-wrap text-gray-900">
                      {row.japanese}
                    </td>
                    <td className="px-4 py-3 whitespace-pre-wrap text-gray-600">
                      {row.annotation ?? (
                        <span className="text-xs text-gray-400">―</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-pre-wrap text-gray-700">
                      {row.promptEn ?? (
                        <span className="text-xs text-gray-400">―</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ul className="list-disc space-y-1 pl-5">
                        {row.correctAnswers.map((answer) => (
                          <li key={answer}>{answer}</li>
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
                    <td className="px-4 py-3 break-all text-xs text-indigo-600">
                      {row.audioUrl ?? (
                        <span className="text-xs text-gray-400">―</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {typeof row.order === "number" ? row.order : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {parseState.rows.length > pageSize ? (
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              <p>
                表示範囲:{" "}
                <span className="font-semibold text-gray-800">
                  {rangeStart}〜{rangeEnd}
                </span>{" "}
                / {parseState.rows.length} 行
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPrevPage}
                  disabled={page === 1}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  前へ
                </button>
                <span className="text-xs text-gray-500">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={onNextPage}
                  disabled={page >= totalPages}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  次へ
                </button>
              </div>
            </div>
          ) : null}

          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            取り込み処理は現在実装中です。プレビューで内容を確認できるようになりました。
          </div>
        </div>
      ) : null}
    </section>
  );
}
