import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ZodError } from "zod";
import { updateMaterial } from "@/external/handler/material/material.command.server";
import { getMaterialHierarchyById } from "@/external/handler/material/material.query.server";
import { MaterialEditForm } from "@/features/materials/components/client/MaterialEditForm";
import { toMaterialDetailPath } from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";

export const dynamic = "force-dynamic";

async function handleUpdateMaterial(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  "use server";

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

export default async function MaterialEditPage({
  params,
}: PageProps<"/materials/[materialId]/edit">) {
  const { materialId } = await params;

  const detail = await getMaterialHierarchyById({ materialId }).catch(
    () => null,
  );

  if (!detail) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-10">
      <nav className="text-sm text-gray-500">
        <Link
          href={toMaterialDetailPath(materialId)}
          className="inline-flex items-center gap-1 text-indigo-600 underline-offset-2 hover:underline"
        >
          ← 教材詳細に戻る
        </Link>
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">教材情報を編集</h1>
        <p className="text-sm text-gray-600">{detail.name}</p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <MaterialEditForm
          action={handleUpdateMaterial}
          defaultValues={{
            materialId,
            name: detail.name,
            description: detail.description,
          }}
        />
      </section>
    </main>
  );
}
