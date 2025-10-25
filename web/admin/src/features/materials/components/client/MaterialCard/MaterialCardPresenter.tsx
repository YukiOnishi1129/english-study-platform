import Link from "next/link";

interface MaterialCardPresenterProps {
  materialId: string;
  name: string;
  description: string | null;
  totalChapters: number;
  totalUnits: number;
  updatedAt: Date;
}

export function MaterialCardPresenter(props: MaterialCardPresenterProps) {
  const {
    materialId,
    name,
    description,
    totalChapters,
    totalUnits,
    updatedAt,
  } = props;

  return (
    <article className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-3">
        <header className="space-y-1">
          <h2 className="text-2xl font-semibold text-gray-900">{name}</h2>
          {description ? (
            <p className="text-sm text-gray-600">{description}</p>
          ) : null}
        </header>

        <dl className="grid gap-4 rounded-md border border-indigo-50 bg-indigo-50/60 p-4 text-sm text-indigo-800 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              章（全階層）
            </dt>
            <dd className="mt-1 text-lg font-bold text-indigo-900">
              {totalChapters}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              UNIT
            </dt>
            <dd className="mt-1 text-lg font-bold text-indigo-900">
              {totalUnits}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              更新日時
            </dt>
            <dd className="mt-1 text-sm text-indigo-900">
              {updatedAt.toLocaleString("ja-JP")}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/materials/${materialId}`}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
        >
          教材詳細へ
        </Link>
        <Link
          href="/materials/create"
          className="inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50"
        >
          新しい教材を作成
        </Link>
      </div>
    </article>
  );
}
