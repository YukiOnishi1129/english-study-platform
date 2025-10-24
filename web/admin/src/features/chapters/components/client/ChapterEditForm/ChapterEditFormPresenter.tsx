"use client";

import type { FormState } from "@/features/materials/types/formState";
import { FormSubmitButton } from "@/shared/components/ui/form-submit-button";
import { Input } from "@/shared/components/ui/input";

interface ChapterEditFormDefaultValues {
  chapterId: string;
  materialId: string;
  parentChapterId: string | null;
  name: string;
  description: string | null;
}

export interface ChapterEditFormPresenterProps {
  state: FormState;
  formAction: (formData: FormData) => void;
  defaultValues: ChapterEditFormDefaultValues;
}

export function ChapterEditFormPresenter(props: ChapterEditFormPresenterProps) {
  const { state, formAction, defaultValues } = props;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="chapterId" value={defaultValues.chapterId} />
      <input type="hidden" name="materialId" value={defaultValues.materialId} />
      <input
        type="hidden"
        name="parentChapterId"
        value={defaultValues.parentChapterId ?? ""}
      />

      <div className="space-y-1">
        <label
          htmlFor="chapter-name"
          className="text-sm font-semibold text-gray-800"
        >
          章名 <span className="text-red-500">*</span>
        </label>
        <Input
          id="chapter-name"
          name="name"
          type="text"
          required
          maxLength={120}
          defaultValue={defaultValues.name}
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="chapter-description"
          className="text-sm font-semibold text-gray-800"
        >
          説明
        </label>
        <textarea
          id="chapter-description"
          name="description"
          rows={3}
          maxLength={500}
          defaultValue={defaultValues.description ?? ""}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus-visible:border-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
        />
      </div>

      {state.status === "error" ? (
        <p className="text-sm text-red-600" role="alert">
          {state.message ?? "変更の保存に失敗しました。"}
        </p>
      ) : null}

      <div className="flex items-center justify-end">
        <FormSubmitButton pendingLabel="保存中..." className="min-w-32">
          変更を保存
        </FormSubmitButton>
      </div>
    </form>
  );
}
