import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChapterDetail } from "@/external/handler/material/material.query.server";
import { ChapterDetailPageTemplate } from "@/features/materials/components/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/chapters/[chapterId]">): Promise<Metadata> {
  try {
    const { chapterId } = await params;
    const detail = await getChapterDetail({
      chapterId,
    });
    return {
      title: `${detail.chapter.name} | ${detail.material.name} - English Study Admin`,
    };
  } catch {
    notFound();
  }
}

export default async function ChapterDetailPage({
  params,
}: PageProps<"/chapters/[chapterId]">) {
  const { chapterId } = await params;
  return <ChapterDetailPageTemplate chapterId={chapterId} />;
}
