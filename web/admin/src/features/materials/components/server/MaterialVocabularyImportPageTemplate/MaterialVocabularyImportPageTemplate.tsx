import { notFound } from "next/navigation";

import type { MaterialChapterSummaryDto } from "@/external/dto/material/material.query.dto";
import { getMaterialHierarchyById } from "@/external/handler/material/material.query.server";
import { MaterialVocabularyImportContent } from "@/features/materials/components/client/MaterialVocabularyImportContent";

interface MaterialVocabularyImportPageTemplateProps {
  materialId: string;
}

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

function collectUnits(
  chapters: MaterialChapterSummaryDto[],
  ancestors: string[] = [],
): VocabularyImportUnitOption[] {
  return chapters.flatMap((chapter) => {
    const chapterPath = [...ancestors, chapter.name];
    const units = chapter.units.map<VocabularyImportUnitOption>((unit) => ({
      unitId: unit.id,
      unitName: unit.name,
      chapterId: chapter.id,
      chapterPath,
      questionCount: unit.questionCount,
    }));

    const childUnits = collectUnits(chapter.children, chapterPath);
    return [...units, ...childUnits];
  });
}

export async function MaterialVocabularyImportPageTemplate({
  materialId,
}: MaterialVocabularyImportPageTemplateProps) {
  const material = await getMaterialHierarchyById({ materialId });

  if (!material) {
    notFound();
  }

  const units = collectUnits(material.chapters);
  const chapterMap = new Map<string, VocabularyImportChapterOption>();
  units.forEach((unit) => {
    if (!chapterMap.has(unit.chapterId)) {
      chapterMap.set(unit.chapterId, {
        chapterId: unit.chapterId,
        path: unit.chapterPath,
      });
    }
  });
  const chapters = Array.from(chapterMap.values()).sort((a, b) => {
    const labelA = a.path.join("/");
    const labelB = b.path.join("/");
    return labelA.localeCompare(labelB, "ja");
  });

  return (
    <MaterialVocabularyImportContent
      materialId={material.id}
      materialName={material.name}
      chapters={chapters}
      units={units}
    />
  );
}
