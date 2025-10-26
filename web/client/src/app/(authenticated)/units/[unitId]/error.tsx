"use client";

export default function UnitError() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-red-600">
        UNITを読み込めませんでした。時間をおいて再度お試しください。
      </p>
    </div>
  );
}
