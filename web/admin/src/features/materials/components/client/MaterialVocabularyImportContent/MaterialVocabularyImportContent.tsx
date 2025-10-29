"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  toMaterialDetailPath,
  toUnitDetailPath,
} from "@/features/materials/lib/paths";
import { VocabularyCsvImporter } from "@/features/units/components/client/VocabularyCsvImporter";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type VocabularyImportUnitOption = {
  unitId: string;
  unitName: string;
  chapterId: string;
  chapterPath: string[];
  questionCount: number;
};

type VocabularyImportChapterOption = {
  chapterId: string;
  path: string[];
};

interface MaterialVocabularyImportContentProps {
  materialId: string;
  materialName: string;
  chapters: VocabularyImportChapterOption[];
  units: VocabularyImportUnitOption[];
}

export function MaterialVocabularyImportContent(
  props: MaterialVocabularyImportContentProps,
) {
  const { materialId, materialName, chapters, units } = props;
  const [selectedChapterId, setSelectedChapterId] = useState<string>(() => {
    if (units.length > 0) {
      return units[0].chapterId;
    }
    return chapters[0]?.chapterId ?? "";
  });
  const filteredUnits = useMemo(
    () => units.filter((unit) => unit.chapterId === selectedChapterId),
    [units, selectedChapterId],
  );

  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    () => units[0]?.unitId ?? "",
  );

  useEffect(() => {
    if (filteredUnits.length === 0) {
      if (selectedUnitId !== "") {
        setSelectedUnitId("");
      }
      return;
    }
    const hasSelectedUnit = filteredUnits.some(
      (unit) => unit.unitId === selectedUnitId,
    );
    if (!hasSelectedUnit) {
      setSelectedUnitId(filteredUnits[0].unitId);
    }
  }, [filteredUnits, selectedUnitId]);

  const selectedUnit = useMemo(
    () => filteredUnits.find((unit) => unit.unitId === selectedUnitId),
    [filteredUnits, selectedUnitId],
  );

  if (units.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
        <nav className="text-sm text-gray-500">
          <Link
            href={toMaterialDetailPath(materialId)}
            className="text-indigo-600 underline-offset-2 hover:underline"
          >
            ← {materialName} に戻る
          </Link>
        </nav>
        <Card className="border border-dashed border-indigo-200 bg-indigo-50/70 px-6 py-8 text-sm text-indigo-800">
          <p className="font-semibold">UNITがまだ登録されていません。</p>
          <p className="mt-2">
            語彙を取り込むには、先に教材内でUNITを作成してください。
          </p>
        </Card>
      </main>
    );
  }

  const displayUnit = selectedUnit ?? filteredUnits[0] ?? null;

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10">
      <nav className="text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/materials"
              className="text-indigo-600 underline-offset-2 hover:underline"
            >
              教材一覧
            </Link>
          </li>
          <li>›</li>
          <li>
            <Link
              href={toMaterialDetailPath(materialId)}
              className="text-indigo-600 underline-offset-2 hover:underline"
            >
              {materialName}
            </Link>
          </li>
          <li>›</li>
          <li className="font-semibold text-gray-700">語彙CSVインポート</li>
        </ol>
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">
          {materialName} の語彙CSVインポート
        </h1>
        <p className="text-sm text-gray-600">
          対象UNITを選択し、語彙CSVを取り込むことで単語と問題を一括登録できます。
        </p>
      </header>

      <Card className="flex flex-col gap-4 border border-gray-200 bg-white p-6 shadow-sm">
        {!displayUnit ? (
          <div className="rounded-md border border-dashed border-indigo-200 bg-indigo-50/70 px-4 py-6 text-sm text-indigo-800">
            <p className="font-semibold">
              この章にはUNITが登録されていません。
            </p>
            <p className="mt-2">
              章を変更するか、教材の管理画面から新しいUNITを追加してください。
            </p>
          </div>
        ) : null}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              対象章
            </p>
            <Select
              value={selectedChapterId}
              onValueChange={(value) => setSelectedChapterId(value)}
            >
              <SelectTrigger className="min-w-[18rem]">
                <SelectValue placeholder="章を選択してください" />
              </SelectTrigger>
              <SelectContent align="start" className="min-w-[18rem]">
                {chapters.map((chapter) => (
                  <SelectItem key={chapter.chapterId} value={chapter.chapterId}>
                    <span className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {chapter.path.length > 0
                          ? chapter.path[chapter.path.length - 1]
                          : "ルート"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {chapter.path.length > 0
                          ? chapter.path.join(" / ")
                          : "ルート"}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              対象UNIT
            </p>
            <Select
              value={selectedUnitId}
              onValueChange={(value) => setSelectedUnitId(value)}
              disabled={filteredUnits.length === 0}
            >
              <SelectTrigger className="min-w-[18rem]">
                <SelectValue placeholder="UNITを選択してください" />
              </SelectTrigger>
              <SelectContent align="start" className="min-w-[18rem]">
                {filteredUnits.map((unit) => (
                  <SelectItem key={unit.unitId} value={unit.unitId}>
                    <span className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {unit.unitName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {unit.chapterPath.length > 0
                          ? unit.chapterPath.join(" / ")
                          : "ルート"}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="self-start md:self-auto"
          >
            <Link
              aria-disabled={!displayUnit}
              className={!displayUnit ? "pointer-events-none opacity-60" : ""}
              href={displayUnit ? toUnitDetailPath(displayUnit.unitId) : "#"}
            >
              UNIT詳細を開く
            </Link>
          </Button>
        </div>

        <div className="grid gap-3 rounded-md bg-gray-50 px-4 py-3 text-xs text-gray-600 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              章の構成
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {displayUnit
                ? displayUnit.chapterPath.length > 0
                  ? displayUnit.chapterPath.join(" / ")
                  : "ルート直下"
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              現在の問題数
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {displayUnit ? `${displayUnit.questionCount} 問` : "-"}
            </p>
          </div>
        </div>
      </Card>

      {displayUnit ? (
        <VocabularyCsvImporter
          unitId={displayUnit.unitId}
          unitName={displayUnit.unitName}
          materialId={materialId}
          chapterId={displayUnit.chapterId}
          existingQuestionCount={displayUnit.questionCount}
        />
      ) : null}
    </main>
  );
}
