import type { Route } from "next";
import Link from "next/link";
import type { FormState } from "@/features/materials/types/formState";
import { FormSubmitButton } from "@/shared/components/ui/form-submit-button";

interface MaterialCreateFormPresenterProps {
  status: FormState["status"];
  message?: string;
  redirect?: string;
  isPending: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
}

export function MaterialCreateFormPresenter(
  props: MaterialCreateFormPresenterProps,
) {
  const { status, message, redirect, isPending, onSubmit } = props;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await onSubmit(formData);
    event.currentTarget.reset();
  };

  return (
    <div className="rounded-lg border border-indigo-100 bg-indigo-50/70 p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label
            htmlFor="material-name"
            className="text-sm font-semibold text-gray-800"
          >
            教材名 <span className="text-red-500">*</span>
          </label>
          <input
            id="material-name"
            name="name"
            type="text"
            required
            maxLength={120}
            placeholder="例: 基礎英会話"
            className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="material-description"
            className="text-sm font-semibold text-gray-800"
          >
            説明
          </label>
          <textarea
            id="material-description"
            name="description"
            rows={3}
            maxLength={500}
            placeholder="教材の目的や概要を記載できます（任意）"
            className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-indigo-700">
            作成後は章とUNITを追加して構成を整えます。
          </p>
          <FormSubmitButton
            isPending={isPending}
            pendingLabel="作成中..."
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            教材を作成
          </FormSubmitButton>
        </div>

        {status === "error" ? (
          <p className="text-sm text-red-600">
            {message ?? "作成に失敗しました。"}
          </p>
        ) : null}
        {status === "success" ? (
          <div className="space-y-1 text-sm">
            <p className="text-emerald-600">教材を作成しました。</p>
            {redirect ? (
              <Link
                href={redirect as Route}
                className="inline-flex items-center gap-1 text-indigo-600 underline-offset-4 hover:underline"
              >
                教材の詳細管理へ進む →
              </Link>
            ) : null}
          </div>
        ) : null}
      </form>
    </div>
  );
}
