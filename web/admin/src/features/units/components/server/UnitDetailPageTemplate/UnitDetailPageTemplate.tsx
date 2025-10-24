import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import {
  deleteUnit,
  updateQuestionOrders,
} from "@/external/handler/material/material.command.server";
import { getUnitDetailAction } from "@/external/handler/material/material.query.action";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toUnitDetailPath,
} from "@/features/materials/lib/paths";
import type { UnitDetailContentPresenterProps } from "@/features/units/components/client/UnitDetailContent";
import { UnitDetailContent } from "@/features/units/components/client/UnitDetailContent";
import { unitKeys } from "@/features/units/queries/keys";
import { ensureUnitDetail } from "@/features/units/queries/validation";
import { getQueryClient } from "@/shared/lib/query-client";

export const dynamic = "force-dynamic";

const deleteUnitAction: UnitDetailContentPresenterProps["onDeleteUnit"] =
  async (data) => {
    "use server";

    try {
      await deleteUnit({ unitId: data.unitId });

      revalidatePath("/materials");
      revalidatePath(toMaterialDetailPath(data.materialId));
      revalidatePath(toChapterDetailPath(data.chapterId));

      return { success: true, message: "UNITを削除しました。" };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "UNITの削除に失敗しました。",
      };
    }
  };

const reorderUnitQuestionsAction: UnitDetailContentPresenterProps["onReorderQuestions"] =
  async (data) => {
    "use server";

    try {
      await updateQuestionOrders({
        unitId: data.unitId,
        orderedQuestionIds: data.orderedQuestionIds,
      });

      revalidatePath("/materials");
      revalidatePath(toMaterialDetailPath(data.materialId));

      const uniqueChapterIds = Array.from(new Set(data.chapterIds));
      for (const chapterId of uniqueChapterIds) {
        revalidatePath(toChapterDetailPath(chapterId));
      }

      revalidatePath(toUnitDetailPath(data.unitId));

      return { success: true, message: "問題の並び順を更新しました。" };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "問題の並び順更新に失敗しました。",
      };
    }
  };

interface UnitDetailPageTemplateProps {
  unitId: string;
}

export async function UnitDetailPageTemplate({
  unitId,
}: UnitDetailPageTemplateProps) {
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: unitKeys.detail(unitId),
      queryFn: async () => {
        const response = await getUnitDetailAction({ unitId });
        if (!response) {
          throw new Error("UNIT_NOT_FOUND");
        }
        return ensureUnitDetail(response);
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNIT_NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  const detail = queryClient.getQueryData(unitKeys.detail(unitId));
  if (!detail) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UnitDetailContent
        unitId={unitId}
        onDeleteUnit={deleteUnitAction}
        onReorderQuestions={reorderUnitQuestionsAction}
      />
    </HydrationBoundary>
  );
}
