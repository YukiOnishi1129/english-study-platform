"use client";

import { useQuery } from "@tanstack/react-query";
import { getChapterDetailAction } from "@/external/handler/material/material.query.action";
import { ensureChapterDetail } from "@/features/materials/queries/validation";
import { chapterKeys } from "./keys";

export function useChapterDetailQuery(chapterId: string) {
  return useQuery({
    queryKey: chapterKeys.detail(chapterId),
    queryFn: async () => {
      const response = await getChapterDetailAction({ chapterId });
      if (!response) {
        throw new Error("CHAPTER_NOT_FOUND");
      }
      return ensureChapterDetail(response);
    },
  });
}
