"use server";

import { ZodError } from "zod";
import { updateUnit } from "@/external/handler/material/material.command.server";
import { toUnitDetailPath } from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";

export async function updateUnitAction(formData: FormData): Promise<FormState> {
  const unitId = formData.get("unitId");
  const name = formData.get("name");
  const description = formData.get("description");

  const unitIdValue = typeof unitId === "string" ? unitId : "";

  try {
    await updateUnit({
      unitId: unitIdValue,
      name: typeof name === "string" ? name : "",
      description:
        typeof description === "string" && description.length > 0
          ? description
          : undefined,
    });

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
