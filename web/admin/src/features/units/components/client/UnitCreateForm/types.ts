import type { FormState } from "@/features/materials/types/formState";

export interface UnitCreateFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  chapterId: string;
  chapterName: string;
  materialId: string;
}

export interface UnitCreateFormPresenterProps {
  state: FormState;
  formAction: (formData: FormData) => void;
  chapterId: string;
  chapterName: string;
  materialId: string;
}
