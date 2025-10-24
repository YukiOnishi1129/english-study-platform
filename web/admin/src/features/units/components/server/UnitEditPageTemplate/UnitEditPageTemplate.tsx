import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { ZodError } from "zod";
import { updateUnit } from "@/external/handler/material/material.command.server";
import { getUnitDetailAction } from "@/external/handler/material/material.query.action";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toUnitDetailPath,
} from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";
import { UnitEditContent } from "@/features/units/components/client/UnitEditContent";
import { unitKeys } from "@/features/units/queries/keys";
import { ensureUnitDetail } from "@/features/units/queries/validation";
import { getQueryClient } from "@/shared/lib/query-client";

export const dynamic = "force-dynamic";

async function handleUpdateUnit(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  "use server";

  const unitId = formData.get("unitId");
  const materialId = formData.get("materialId");
  const chapterId = formData.get("chapterId");
  const name = formData.get("name");
  const description = formData.get("description");

  const unitIdValue = typeof unitId === "string" ? unitId : "";
  const materialIdValue = typeof materialId === "string" ? materialId : "";
  const chapterIdValue = typeof chapterId === "string" ? chapterId : "";

  try {
    await updateUnit({
      unitId: unitIdValue,
      name: typeof name === "string" ? name : "",
      description:
        typeof description === "string" && description.length > 0
          ? description
          : undefined,
    });

    if (materialIdValue) {
      revalidatePath(toMaterialDetailPath(materialIdValue));
    }
    if (chapterIdValue) {
      revalidatePath(toChapterDetailPath(chapterIdValue));
    }
    if (unitIdValue) {
      revalidatePath(toUnitDetailPath(unitIdValue));
    }
    revalidatePath("/materials");

    return {
      status: "success",
      redirect: unitIdValue ? toUnitDetailPath(unitIdValue) : undefined,
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
        error instanceof Error ? error.message : "UNITの更新に失敗しました。",
    };
  }
}

interface UnitEditPageTemplateProps {
  unitId: string;
}

export async function UnitEditPageTemplate({
  unitId,
}: UnitEditPageTemplateProps) {
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
      <UnitEditContent unitId={unitId} onSubmit={handleUpdateUnit} />
    </HydrationBoundary>
  );
}
