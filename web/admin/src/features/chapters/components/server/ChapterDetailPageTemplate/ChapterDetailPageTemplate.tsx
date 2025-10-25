import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getChapterDetail } from "@/external/handler/material/material.query.server";
import { ChapterDetailContent } from "@/features/chapters/components/client/ChapterDetailContent";
import { chapterKeys } from "@/features/chapters/queries/keys";
import { getQueryClient } from "@/shared/lib/query-client";

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
      queryFn: async () => getChapterDetail({ chapterId }),
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
      <ChapterDetailContent chapterId={chapterId} />
    </HydrationBoundary>
  );
}
