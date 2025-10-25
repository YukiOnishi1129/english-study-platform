"use client";

import { useQuery } from "@tanstack/react-query";
import { getChapterDetailAction } from "@/external/handler/material/material.query.action";
import { chapterKeys } from "./keys";

export function useChapterDetailQuery(chapterId: string) {
  return useQuery({
    queryKey: chapterKeys.detail(chapterId),
    queryFn: async () => getChapterDetailAction({ chapterId }),
  });
}
