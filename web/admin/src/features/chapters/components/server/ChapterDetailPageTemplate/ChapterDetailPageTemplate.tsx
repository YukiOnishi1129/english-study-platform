import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { ZodError } from "zod";
import {
  createChapter,
  createUnit,
  deleteChapter,
  updateUnitOrders,
} from "@/external/handler/material/material.command.server";
import { getChapterDetailAction } from "@/external/handler/material/material.query.action";
import { ChapterDetailContent } from "@/features/chapters/components/client/ChapterDetailContent";
import { chapterKeys } from "@/features/chapters/queries/keys";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toUnitDetailPath,
} from "@/features/materials/lib/paths";
import { ensureChapterDetail } from "@/features/materials/queries/validation";
import type {
  FormRedirect,
  FormState,
} from "@/features/materials/types/formState";
import type { ReorderUnitsActionPayload } from "@/features/materials/types/reorderUnitsAction";
import { getQueryClient } from "@/shared/lib/query-client";

export const dynamic = "force-dynamic";

async function deleteChapterAction(data: {
  chapterId: string;
  materialId: string;
  parentChapterId: string | null;
  ancestorChapterIds: string[];
}): Promise<{ success: boolean; message?: string; redirect?: FormRedirect }> {
  "use server";

  try {
    await deleteChapter({ chapterId: data.chapterId });

    revalidatePath("/materials");
    revalidatePath(toMaterialDetailPath(data.materialId));

    const uniqueAncestorIds = Array.from(
      new Set(
        data.ancestorChapterIds.filter(
          (id): id is string => typeof id === "string" && id.length > 0,
        ),
      ),
    );

    for (const ancestorId of uniqueAncestorIds) {
      revalidatePath(toChapterDetailPath(ancestorId));
    }

    revalidatePath(toChapterDetailPath(data.chapterId));

    return {
      success: true,
      redirect: data.parentChapterId
        ? toChapterDetailPath(data.parentChapterId)
        : toMaterialDetailPath(data.materialId),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "章の削除に失敗しました。",
    };
  }
}

async function handleCreateUnit(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  "use server";

  const chapterIdEntry = formData.get("chapterId");
  const materialIdEntry = formData.get("materialId");
  const name = formData.get("name");
  const description = formData.get("description");

  const chapterId = typeof chapterIdEntry === "string" ? chapterIdEntry : "";
  const materialId = typeof materialIdEntry === "string" ? materialIdEntry : "";

  try {
    const unit = await createUnit({
      chapterId,
      name: typeof name === "string" ? name : "",
      description: typeof description === "string" ? description : undefined,
    });

    if (materialId) {
      revalidatePath(toMaterialDetailPath(materialId));
    }
    if (chapterId) {
      revalidatePath(toChapterDetailPath(chapterId));
    }

    revalidatePath("/materials");

    return {
      status: "success",
      redirect: toUnitDetailPath(unit.id),
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
        error instanceof Error ? error.message : "UNITの作成に失敗しました。",
    };
  }
}

async function handleCreateChapter(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  "use server";

  const materialId = formData.get("materialId");
  const parentChapterId = formData.get("parentChapterId");
  const name = formData.get("name");
  const description = formData.get("description");

  const materialIdValue = typeof materialId === "string" ? materialId : "";
  const parentChapterIdValue =
    typeof parentChapterId === "string" && parentChapterId.length > 0
      ? parentChapterId
      : undefined;

  try {
    await createChapter({
      materialId: materialIdValue,
      parentChapterId: parentChapterIdValue,
      name: typeof name === "string" ? name : "",
      description: typeof description === "string" ? description : undefined,
    });

    if (materialIdValue) {
      revalidatePath(toMaterialDetailPath(materialIdValue));
    }
    if (parentChapterIdValue) {
      revalidatePath(toChapterDetailPath(parentChapterIdValue));
    }

    revalidatePath("/materials");

    return { status: "success" };
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
        error instanceof Error ? error.message : "章の作成に失敗しました。",
    };
  }
}

async function handleReorderUnits(
  payload: ReorderUnitsActionPayload,
): Promise<FormState> {
  "use server";

  try {
    await updateUnitOrders({
      chapterId: payload.chapterId,
      orderedUnitIds: payload.orderedUnitIds,
    });

    revalidatePath("/materials");
    revalidatePath(toMaterialDetailPath(payload.materialId));
    revalidatePath(toChapterDetailPath(payload.chapterId));

    return {
      status: "success",
      message: "UNITの並び順を更新しました。",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "UNITの並び順を更新できませんでした。",
    };
  }
}

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
        onCreateChapter={handleCreateChapter}
        onCreateUnit={handleCreateUnit}
        onReorderUnits={handleReorderUnits}
        onDeleteChapter={deleteChapterAction}
      />
    </HydrationBoundary>
  );
}
