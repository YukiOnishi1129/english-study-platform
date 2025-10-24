"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { updateMaterial } from "@/external/handler/material/material.command.server";
import { toMaterialDetailPath } from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";

export async function updateMaterialAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const materialId = formData.get("materialId");
  const name = formData.get("name");
  const description = formData.get("description");

  const materialIdValue = typeof materialId === "string" ? materialId : "";

  try {
    await updateMaterial({
      materialId: materialIdValue,
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

    return {
      status: "success",
      redirect: materialIdValue
        ? toMaterialDetailPath(materialIdValue)
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
        error instanceof Error ? error.message : "教材の更新に失敗しました。",
    };
  }
}
