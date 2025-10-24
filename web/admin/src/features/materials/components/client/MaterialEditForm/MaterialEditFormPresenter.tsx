import type { FormState } from "@/features/materials/types/formState";
import { FormSubmitButton } from "@/shared/components/ui/form-submit-button";
import { Input } from "@/shared/components/ui/input";

interface MaterialEditFormPresenterProps {
  formAction: (formData: FormData) => void;
  state: FormState;
  defaultValues: {
    materialId: string;
    name: string;
    description: string | null;
  };
}

export function MaterialEditFormPresenter(
  props: MaterialEditFormPresenterProps,
) {
  const { formAction, state, defaultValues } = props;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="materialId" value={defaultValues.materialId} />

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
          defaultValue={defaultValues.name}
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
