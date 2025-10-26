export default async function Page({
  params,
}: PageProps<"/units/[unitId]/study">) {
  const { unitId } = await params;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900">
        UNIT {unitId} の学習ページ（準備中）
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        現在このページの実装を進めています。学習コンテンツは近日公開予定です。
      </p>
    </div>
  );
}
