"use client";

import { ChapterUnitListPresenter } from "./ChapterUnitListPresenter";
import type { ChapterUnitListProps } from "./types";
import { useChapterUnitList } from "./useChapterUnitList";

export function ChapterUnitList(props: ChapterUnitListProps) {
  const state = useChapterUnitList(props);
  return <ChapterUnitListPresenter {...state} />;
}
