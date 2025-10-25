import Link from "next/link";
import type { MaterialHierarchyItemDto } from "@/external/dto/material/material.query.dto";
import { MaterialCard } from "../MaterialCard";

interface MaterialListPresenterProps {
  materials: MaterialHierarchyItemDto[];
  isLoading: boolean;
  isError: boolean;
}

export function MaterialListPresenter(props: MaterialListPresenterProps) {
  const { materials, isLoading, isError } = props;

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4).keys()].map((index) => (
          <div
            key={index}
            className="h-48 animate-pulse rounded-lg border border-gray-200 bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        教材一覧の取得に失敗しました。時間を置いて再度お試しください。
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center gap-6 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
        <div>
          <p className="text-base font-medium text-gray-700">
            まだ教材が登録されていません。
          </p>
          <p className="mt-2 text-sm">
            まず教材を作成し、その後、章やUNITを追加して構成を整えましょう。
          </p>
        </div>
        <Link
          href="/materials/create"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
        >
          教材を作成する
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {materials.map((material) => (
        <MaterialCard key={material.id} material={material} />
      ))}
    </div>
  );
}
