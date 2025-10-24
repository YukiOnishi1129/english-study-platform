"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/features/materials/types/formState";
import { initialFormState } from "@/features/materials/types/formState";

interface UnitEditFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues: {
    unitId: string;
    materialId: string;
    chapterId: string;
    name: string;
    description: string | null;
  };
}

function SubmitButton() {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      disabled={status.pending}
      className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
    >
      {status.pending ? "保存中..." : "変更を保存"}
    </button>
  );
}

export function UnitEditForm(props: UnitEditFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(props.action, initialFormState);

  useEffect(() => {
    if (state.status === "success" && state.redirect) {
      router.replace(state.redirect);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="unitId" value={props.defaultValues.unitId} />
      <input
        type="hidden"
        name="materialId"
        value={props.defaultValues.materialId}
      />
      <input
        type="hidden"
        name="chapterId"
        value={props.defaultValues.chapterId}
      />

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
          defaultValue={props.defaultValues.name}
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
          defaultValue={props.defaultValues.description ?? ""}
          className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {state.status === "error" ? (
        <p className="text-sm text-red-600">
          {state.message ?? "変更の保存に失敗しました。"}
        </p>
      ) : null}

      <div className="flex items-center justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
