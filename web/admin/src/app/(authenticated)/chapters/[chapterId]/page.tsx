import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ZodError } from "zod";
import {
  createChapter,
  createUnit,
  updateUnitOrders,
} from "@/external/handler/material/material.command.server";
import { getChapterDetail } from "@/external/handler/material/material.query.server";
import { ChapterCreateForm } from "@/features/materials/components/client/ChapterCreateForm";
import { ChapterUnitList } from "@/features/materials/components/client/ChapterUnitList";
import { UnitCreateForm } from "@/features/materials/components/client/UnitCreateForm";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toUnitDetailPath,
} from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";

export const dynamic = "force-dynamic";

async function handleCreateUnit(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  "use server";

  const chapterIdEntry = formData.get("chapterId");
  const materialIdEntry = formData.get("materialId");
  const name = formData.get("name");
  const description = formData.get("description");

  const chapterId = typeof chapterIdEntry === "string" ? chapterIdEntry : "";
  const materialId = typeof materialIdEntry === "string" ? materialIdEntry : "";

  try {
    const unit = await createUnit({
      chapterId,
      name: typeof name === "string" ? name : "",
      description: typeof description === "string" ? description : undefined,
    });

    if (materialId) {
      revalidatePath(toMaterialDetailPath(materialId));
    }
    if (chapterId) {
      revalidatePath(toChapterDetailPath(chapterId));
    }

    revalidatePath("/materials");

    return {
      status: "success",
      redirect: toUnitDetailPath(unit.id),
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
        error instanceof Error ? error.message : "UNITの作成に失敗しました。",
    };
  }
}

async function handleCreateChapter(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  "use server";

  const materialId = formData.get("materialId");
  const parentChapterId = formData.get("parentChapterId");
  const name = formData.get("name");
  const description = formData.get("description");

  const materialIdValue = typeof materialId === "string" ? materialId : "";
  const parentChapterIdValue =
    typeof parentChapterId === "string" && parentChapterId.length > 0
      ? parentChapterId
      : undefined;

  try {
    await createChapter({
      materialId: materialIdValue,
      parentChapterId: parentChapterIdValue,
      name: typeof name === "string" ? name : "",
      description: typeof description === "string" ? description : undefined,
    });

    if (materialIdValue) {
      revalidatePath(toMaterialDetailPath(materialIdValue));
    }
    if (parentChapterIdValue) {
      revalidatePath(toChapterDetailPath(parentChapterIdValue));
    }

    revalidatePath("/materials");

    return { status: "success" };
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
        error instanceof Error ? error.message : "章の作成に失敗しました。",
    };
  }
}

async function handleReorderUnits(payload: {
  materialId: string;
  chapterId: string;
  orderedUnitIds: string[];
}): Promise<FormState> {
  "use server";

  try {
    await updateUnitOrders({
      chapterId: payload.chapterId,
      orderedUnitIds: payload.orderedUnitIds,
    });

    revalidatePath("/materials");
    revalidatePath(toMaterialDetailPath(payload.materialId));
    revalidatePath(toChapterDetailPath(payload.chapterId));

    return {
      status: "success",
      message: "UNITの並び順を更新しました。",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "UNITの並び順を更新できませんでした。",
    };
  }
}

interface ChapterDetailPageProps {
  params: {
    chapterId: string;
  };
}

export async function generateMetadata(
  props: ChapterDetailPageProps,
): Promise<Metadata> {
  try {
    const detail = await getChapterDetail({
      chapterId: props.params.chapterId,
    });
    return {
      title: `${detail.chapter.name} | ${detail.material.name} - English Study Admin`,
    };
  } catch {
    notFound();
  }
}

export default async function ChapterDetailPage(props: ChapterDetailPageProps) {
  const detail = await getChapterDetail({
    chapterId: props.params.chapterId,
  }).catch(() => null);

  if (!detail) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-10">
      <nav className="text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/materials"
              className="text-indigo-600 underline-offset-2 hover:underline"
            >
              教材一覧
            </Link>
          </li>
          <li>›</li>
          <li>
            <Link
              href={toMaterialDetailPath(detail.material.id)}
              className="text-indigo-600 underline-offset-2 hover:underline"
            >
              {detail.material.name}
            </Link>
          </li>
          {detail.ancestors.map((ancestor) => (
            <li key={ancestor.id} className="flex items-center gap-2">
              <span>›</span>
              <Link
                href={toChapterDetailPath(ancestor.id)}
                className="text-indigo-600 underline-offset-2 hover:underline"
              >
                {ancestor.name}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span>›</span>
            <span className="font-semibold text-gray-700">
              {detail.chapter.name}
            </span>
          </li>
        </ol>
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {detail.chapter.name}
        </h1>
        <p className="text-sm text-gray-600">
          {detail.chapter.description ?? "説明は登録されていません。"}
        </p>
      </header>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">UNIT一覧</h2>
          <UnitCreateForm
            action={handleCreateUnit}
            chapterId={detail.chapter.id}
            materialId={detail.material.id}
            chapterName={detail.chapter.name}
          />
        </header>

        <ChapterUnitList
          materialId={detail.material.id}
          chapterId={detail.chapter.id}
          units={detail.chapter.units}
          onReorder={handleReorderUnits}
        />
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">子章</h2>
          <ChapterCreateForm
            action={handleCreateChapter}
            materialId={detail.material.id}
            parentChapterId={detail.chapter.id}
            parentChapterName={detail.chapter.name}
          />
        </header>
        {detail.chapter.children.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-600">
            子章は登録されていません。
          </p>
        ) : (
          <ul className="space-y-2">
            {detail.chapter.children.map((child) => (
              <li
                key={child.id}
                className="rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={toChapterDetailPath(child.id)}
                    className="text-sm font-semibold text-indigo-700 underline-offset-2 hover:underline"
                  >
                    {child.name}
                  </Link>
                  <span className="text-xs text-gray-500">
                    {child.units.reduce(
                      (sum, unit) => sum + unit.questionCount,
                      0,
                    )}{" "}
                    問
                  </span>
                </div>
                {child.description ? (
                  <p className="mt-1 text-xs text-gray-600">
                    {child.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
