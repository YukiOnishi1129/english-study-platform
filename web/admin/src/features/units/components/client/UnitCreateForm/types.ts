import type { FormState } from "@/features/materials/types/formState";

export interface UnitCreateFormProps {
  chapterId: string;
  chapterName: string;
  materialId: string;
  invalidateChapterId?: string;
}

export interface UnitCreateFormPresenterProps {
  chapterId: string;
  chapterName: string;
  materialId: string;
  status: FormState["status"];
  message?: string;
  isPending: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
}
