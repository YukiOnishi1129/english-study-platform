import Link from "next/link";
import { notFound } from "next/navigation";
import { getMaterialHierarchyById } from "@/external/handler/material/material.query.server";
import { MaterialEditForm } from "@/features/materials/components/client/MaterialEditForm";
import { toMaterialDetailPath } from "@/features/materials/lib/paths";

export const dynamic = "force-dynamic";

interface MaterialEditPageTemplateProps {
  materialId: string;
}

export async function MaterialEditPageTemplate(
  props: MaterialEditPageTemplateProps,
) {
  const detail = await getMaterialHierarchyById({
    materialId: props.materialId,
  }).catch(() => null);

  if (!detail) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-10">
      <nav className="text-sm text-gray-500">
        <Link
          href={toMaterialDetailPath(props.materialId)}
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
          defaultValues={{
            materialId: props.materialId,
            name: detail.name,
            description: detail.description,
          }}
        />
      </section>
    </main>
  );
}
