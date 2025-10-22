import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ZodError } from "zod";
import { createMaterial } from "@/external/handler/material/material.command.server";
import { MaterialCreateForm } from "@/features/materials/components/client/MaterialCreateForm";
import { toMaterialDetailPath } from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";

export const dynamic = "force-dynamic";

async function handleCreateMaterial(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  "use server";

  const name = formData.get("name");
  const description = formData.get("description");

  try {
    const material = await createMaterial({
      name: typeof name === "string" ? name : "",
      description:
        typeof description === "string" && description.length > 0
          ? description
          : undefined,
    });

    const detailPath = toMaterialDetailPath(material.id);
    revalidatePath("/materials");
    revalidatePath(detailPath);

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

export default function MaterialCreatePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">新規教材を作成</h1>
        <p className="text-sm text-gray-600">
          教材の基本情報を入力してください。作成後に章やUNITを追加できます。
        </p>
      </header>

      <section>
        <MaterialCreateForm action={handleCreateMaterial} />
      </section>

      <footer className="mt-auto">
        <Link
          href="/materials"
          className="inline-flex items-center gap-2 text-sm text-gray-600 underline-offset-4 hover:underline"
        >
          ← 教材一覧へ戻る
        </Link>
      </footer>
    </main>
  );
}
