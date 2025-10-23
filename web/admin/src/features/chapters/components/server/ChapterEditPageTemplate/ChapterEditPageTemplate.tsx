import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { ZodError } from "zod";
import { updateChapter } from "@/external/handler/material/material.command.server";
import { getChapterDetailAction } from "@/external/handler/material/material.query.action";
import { ChapterEditContent } from "@/features/chapters/components/client/ChapterEditContent";
import { chapterKeys } from "@/features/chapters/queries/keys";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
} from "@/features/materials/lib/paths";
import { ensureChapterDetail } from "@/features/materials/queries/validation";
import type { FormState } from "@/features/materials/types/formState";
import { getQueryClient } from "@/shared/lib/query-client";

export const dynamic = "force-dynamic";

async function handleUpdateChapter(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  "use server";

  const chapterId = formData.get("chapterId");
  const materialId = formData.get("materialId");
  const parentChapterId = formData.get("parentChapterId");
  const name = formData.get("name");
  const description = formData.get("description");

  const chapterIdValue = typeof chapterId === "string" ? chapterId : "";
  const materialIdValue = typeof materialId === "string" ? materialId : "";
  const parentChapterIdValue =
    typeof parentChapterId === "string" && parentChapterId.length > 0
      ? parentChapterId
      : undefined;

  try {
    await updateChapter({
      chapterId: chapterIdValue,
      name: typeof name === "string" ? name : "",
      description:
        typeof description === "string" && description.length > 0
          ? description
          : undefined,
    });

    revalidatePath("/materials");
    if (materialIdValue) {
      revalidatePath(toMaterialDetailPath(materialIdValue));
    }
    if (chapterIdValue) {
      revalidatePath(toChapterDetailPath(chapterIdValue));
    }
    if (parentChapterIdValue) {
      revalidatePath(toChapterDetailPath(parentChapterIdValue));
    }

    return {
      status: "success",
      redirect: chapterIdValue
        ? toChapterDetailPath(chapterIdValue)
        : undefined,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues ?? [];
      return {
        status: "error",
        message: issues[0]?.message ?? "入力内容を確認してください。",
      };
    }
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "章の更新に失敗しました。",
    };
  }
}

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
        onSubmit={handleUpdateChapter}
      />
    </HydrationBoundary>
  );
}
