"use client";

import { FormSubmitButton } from "@/shared/components/ui/form-submit-button";
import type { UnitEditFormPresenterProps } from "./types";

export function UnitEditFormPresenter(props: UnitEditFormPresenterProps) {
  const { defaultValues, status, message, isPending, onSubmit } = props;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="unitId" value={defaultValues.unitId} />
      <input type="hidden" name="materialId" value={defaultValues.materialId} />
      <input type="hidden" name="chapterId" value={defaultValues.chapterId} />

      <div className="space-y-1">
        <label
          htmlFor="unit-name"
          className="text-sm font-semibold text-gray-800"
        >
          UNIT名 <span className="text-red-500">*</span>
        </label>
        <input
          id="unit-name"
          name="name"
          type="text"
          required
          maxLength={120}
          defaultValue={defaultValues.name}
          className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="unit-description"
          className="text-sm font-semibold text-gray-800"
        >
          説明
        </label>
        <textarea
          id="unit-description"
          name="description"
          rows={3}
          maxLength={500}
          defaultValue={defaultValues.description ?? ""}
          className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {status === "error" ? (
        <p className="text-sm text-red-600">
          {message ?? "変更の保存に失敗しました。"}
        </p>
      ) : null}

      <div className="flex items-center justify-end">
        <FormSubmitButton pendingLabel="保存中..." isPending={isPending}>
          変更を保存
        </FormSubmitButton>
      </div>
    </form>
  );
}
