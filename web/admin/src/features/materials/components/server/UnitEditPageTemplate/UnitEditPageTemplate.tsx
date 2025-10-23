import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ZodError } from "zod";
import { updateUnit } from "@/external/handler/material/material.command.server";
import { getUnitDetail } from "@/external/handler/material/material.query.server";
import { UnitEditForm } from "@/features/materials/components/client/UnitEditForm";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toUnitDetailPath,
} from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";

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

export async function UnitEditPageTemplate(props: UnitEditPageTemplateProps) {
  const detail = await getUnitDetail({ unitId: props.unitId }).catch(
    () => null,
  );

  if (!detail) {
    notFound();
  }

  const currentChapter = detail.chapterPath[detail.chapterPath.length - 1];

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-10">
      <nav className="text-sm text-gray-500">
        <Link
          href={toUnitDetailPath(props.unitId)}
          className="inline-flex items-center gap-1 text-indigo-600 underline-offset-2 hover:underline"
        >
          ← UNIT詳細に戻る
        </Link>
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">UNIT情報を編集</h1>
        <p className="text-sm text-gray-600">
          {detail.material.name} /{" "}
          {detail.chapterPath.map((chapter) => chapter.name).join(" / ")} /{" "}
          {detail.unit.name}
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <UnitEditForm
          action={handleUpdateUnit}
          defaultValues={{
            unitId: props.unitId,
            materialId: detail.material.id,
            chapterId: currentChapter?.id ?? detail.unit.chapterId,
            name: detail.unit.name,
            description: detail.unit.description,
          }}
        />
      </section>
    </main>
  );
}
