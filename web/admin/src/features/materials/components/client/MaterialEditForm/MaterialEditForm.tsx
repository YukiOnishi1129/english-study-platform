"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/features/materials/types/formState";
import { initialFormState } from "@/features/materials/types/formState";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface MaterialEditFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues: {
    materialId: string;
    name: string;
    description: string | null;
  };
}

function SubmitButton() {
  const status = useFormStatus();
  return (
    <Button type="submit" disabled={status.pending} className="min-w-32">
      {status.pending ? "保存中..." : "変更を保存"}
    </Button>
  );
}

export function MaterialEditForm(props: MaterialEditFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(props.action, initialFormState);

  useEffect(() => {
    if (state.status === "success" && state.redirect) {
      router.replace(state.redirect);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <input
        type="hidden"
        name="materialId"
        value={props.defaultValues.materialId}
      />

      <div className="space-y-1">
        <label
          htmlFor="material-name"
          className="text-sm font-semibold text-gray-800"
        >
          教材名 <span className="text-red-500">*</span>
        </label>
        <Input
          id="material-name"
          name="name"
          type="text"
          required
          maxLength={120}
          defaultValue={props.defaultValues.name}
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
          defaultValue={props.defaultValues.description ?? ""}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus-visible:border-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
        />
      </div>

      {state.status === "error" ? (
        <p className="text-sm text-red-600" role="alert">
          {state.message ?? "変更の保存に失敗しました。"}
        </p>
      ) : null}

      <div className="flex items-center justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
