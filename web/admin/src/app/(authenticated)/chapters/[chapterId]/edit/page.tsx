import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ZodError } from "zod";
import { updateChapter } from "@/external/handler/material/material.command.server";
import { getChapterDetail } from "@/external/handler/material/material.query.server";
import { ChapterEditForm } from "@/features/materials/components/client/ChapterEditForm";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
} from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";

export const dynamic = "force-dynamic";

async function handleUpdateChapter(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  "use server";

  const chapterId = formData.get("chapterId");
  const materialId = formData.get("materialId");
  const parentChapterId = formData.get("parentChapterId");
  const name = formData.get("name");
  const description = formData.get("description");

  const chapterIdValue = typeof chapterId === "string" ? chapterId : "";
  const materialIdValue = typeof materialId === "string" ? materialId : "";
  const parentChapterIdValue =
    typeof parentChapterId === "string" && parentChapterId.length > 0
      ? parentChapterId
      : undefined;

  try {
    await updateChapter({
      chapterId: chapterIdValue,
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
    if (chapterIdValue) {
      revalidatePath(toChapterDetailPath(chapterIdValue));
    }
    if (parentChapterIdValue) {
      revalidatePath(toChapterDetailPath(parentChapterIdValue));
    }

    return {
      status: "success",
      redirect: chapterIdValue
        ? toChapterDetailPath(chapterIdValue)
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
        error instanceof Error ? error.message : "章の更新に失敗しました。",
    };
  }
}

export default async function ChapterEditPage({
  params,
}: PageProps<"/chapters/[chapterId]/edit">) {
  const { chapterId } = await params;

  const detail = await getChapterDetail({ chapterId }).catch(() => null);

  if (!detail) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-10">
      <nav className="text-sm text-gray-500">
        <Link
          href={toChapterDetailPath(chapterId)}
          className="inline-flex items-center gap-1 text-indigo-600 underline-offset-2 hover:underline"
        >
          ← 章詳細に戻る
        </Link>
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">章情報を編集</h1>
        <p className="text-sm text-gray-600">
          {detail.material.name}
          {detail.ancestors.length > 0
            ? ` / ${detail.ancestors.map((item) => item.name).join(" / ")}`
            : ""}
          {detail.ancestors.length > 0 ? " / " : ""}
          {detail.chapter.name}
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <ChapterEditForm
          action={handleUpdateChapter}
          defaultValues={{
            chapterId,
            materialId: detail.material.id,
            parentChapterId: detail.chapter.parentChapterId,
            name: detail.chapter.name,
            description: detail.chapter.description,
          }}
        />
      </section>
    </main>
  );
}
