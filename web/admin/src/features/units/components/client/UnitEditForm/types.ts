import type { FormState } from "@/features/materials/types/formState";

export interface UnitEditFormDefaultValues {
  unitId: string;
  materialId: string;
  chapterId: string;
  name: string;
  description: string | null;
}

export interface UnitEditFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues: UnitEditFormDefaultValues;
}

export interface UnitEditFormPresenterProps {
  state: FormState;
  formAction: (formData: FormData) => void;
  defaultValues: UnitEditFormDefaultValues;
}
