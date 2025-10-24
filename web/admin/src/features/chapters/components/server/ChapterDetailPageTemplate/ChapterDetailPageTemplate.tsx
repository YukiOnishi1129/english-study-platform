import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getChapterDetailAction } from "@/external/handler/material/material.query.action";
import { ChapterDetailContent } from "@/features/chapters/components/client/ChapterDetailContent";
import { chapterKeys } from "@/features/chapters/queries/keys";
import { ensureChapterDetail } from "@/features/chapters/queries/validation";
import { getQueryClient } from "@/shared/lib/query-client";
import {
  createChapterAction,
  createUnitAction,
  deleteChapterAction,
  reorderUnitsAction,
} from "./actions";

export const dynamic = "force-dynamic";

interface ChapterDetailPageTemplateProps {
  chapterId: string;
}

export async function ChapterDetailPageTemplate({
  chapterId,
}: ChapterDetailPageTemplateProps) {
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: chapterKeys.detail(chapterId),
      queryFn: async () => {
        const response = await getChapterDetailAction({ chapterId });
        if (!response) {
          throw new Error("CHAPTER_NOT_FOUND");
        }
        return ensureChapterDetail(response);
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CHAPTER_NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  const detail = queryClient.getQueryData(chapterKeys.detail(chapterId));
  if (!detail) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ChapterDetailContent
        chapterId={chapterId}
        onCreateChapter={createChapterAction}
        onCreateUnit={createUnitAction}
        onReorderUnits={reorderUnitsAction}
        onDeleteChapter={deleteChapterAction}
      />
    </HydrationBoundary>
  );
}
