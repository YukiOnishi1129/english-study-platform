export interface UnitEditFormDefaultValues {
  unitId: string;
  materialId: string;
  chapterId: string;
  name: string;
  description: string | null;
}

export interface UnitEditFormProps {
  defaultValues: UnitEditFormDefaultValues;
}

export interface UnitEditFormPresenterProps {
  defaultValues: UnitEditFormDefaultValues;
  status: "idle" | "success" | "error";
  message?: string;
  isPending: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
}
