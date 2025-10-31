"use server";

import { ZodError } from "zod";
import { createMaterial } from "@/external/handler/material/material.command.server";
import { toMaterialDetailPath } from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";

export async function createMaterialAction(
  formData: FormData,
): Promise<FormState> {
  const name = formData.get("name");
  const description = formData.get("description");
  const contentTypeId = formData.get("contentTypeId");

  try {
    const material = await createMaterial({
      name: typeof name === "string" ? name : "",
      description:
        typeof description === "string" && description.length > 0
          ? description
          : undefined,
      contentTypeId:
        typeof contentTypeId === "string" && contentTypeId.length > 0
          ? contentTypeId
          : "",
    });

    const detailPath = toMaterialDetailPath(material.id);

    return {
      status: "success",
      message: "教材を作成しました。",
      redirect: detailPath,
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
        error instanceof Error ? error.message : "教材の作成に失敗しました。",
    };
  }
}
