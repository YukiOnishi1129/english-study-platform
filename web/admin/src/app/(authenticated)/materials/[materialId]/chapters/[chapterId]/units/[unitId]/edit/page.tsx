import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ZodError } from "zod";
import type { UnitDetailDto } from "@/external/dto/material/material.query.dto";
import { updateUnit } from "@/external/handler/material/material.command.server";
import { getUnitDetail } from "@/external/handler/material/material.query.server";
import { UnitEditForm } from "@/features/materials/components/client/UnitEditForm";
import { toUnitDetailPath } from "@/features/materials/lib/paths";
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
      revalidatePath(`/materials/${materialIdValue}`);
    }
    if (materialIdValue && chapterIdValue && unitIdValue) {
      revalidatePath(
        `/materials/${materialIdValue}/chapters/${chapterIdValue}/units/${unitIdValue}`,
      );
    }
    revalidatePath("/materials");

    const redirectPath =
      materialIdValue && chapterIdValue && unitIdValue
        ? toUnitDetailPath(materialIdValue, chapterIdValue, unitIdValue)
        : undefined;

    return {
      status: "success",
      redirect: redirectPath,
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

interface UnitEditPageProps {
  params: {
    materialId: string;
    chapterId: string;
    unitId: string;
  };
}

export default async function UnitEditPage(props: UnitEditPageProps) {
  let detail: UnitDetailDto;
  try {
    detail = await getUnitDetail({ unitId: props.params.unitId });
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-10">
      <nav className="text-sm text-gray-500">
        <Link
          href={`/materials/${props.params.materialId}/chapters/${props.params.chapterId}/units/${props.params.unitId}`}
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
            unitId: props.params.unitId,
            materialId: props.params.materialId,
            chapterId: props.params.chapterId,
            name: detail.unit.name,
            description: detail.unit.description,
          }}
        />
      </section>
    </main>
  );
}
