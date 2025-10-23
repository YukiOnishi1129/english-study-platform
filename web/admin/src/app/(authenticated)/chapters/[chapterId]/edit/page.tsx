import { ChapterEditPageTemplate } from "@/features/materials/components/server";

export default async function ChapterEditPage({
  params,
}: PageProps<"/chapters/[chapterId]/edit">) {
  const { chapterId } = await params;
  return <ChapterEditPageTemplate chapterId={chapterId} />;
}
