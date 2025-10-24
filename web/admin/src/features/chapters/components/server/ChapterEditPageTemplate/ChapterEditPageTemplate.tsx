import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getChapterDetailAction } from "@/external/handler/material/material.query.action";
import { ChapterEditContent } from "@/features/chapters/components/client/ChapterEditContent";
import { chapterKeys } from "@/features/chapters/queries/keys";
import { ensureChapterDetail } from "@/features/chapters/queries/validation";
import { getQueryClient } from "@/shared/lib/query-client";
import { updateChapterAction } from "./actions";

export const dynamic = "force-dynamic";

interface ChapterEditPageTemplateProps {
  chapterId: string;
}

export async function ChapterEditPageTemplate({
  chapterId,
}: ChapterEditPageTemplateProps) {
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
      <ChapterEditContent
        chapterId={chapterId}
        onSubmit={updateChapterAction}
      />
    </HydrationBoundary>
  );
}
