import type { FormState } from "@/features/materials/types/formState";
import type { AnswerField } from "@/features/questions/lib/answer-fields";

export interface QuestionEditFormDefaultValues {
  questionId: string;
  unitId: string;
  japanese: string;
  hint: string | null;
  explanation: string | null;
  order: number;
  correctAnswers: string[];
}

export interface QuestionEditFormProps {
  defaultValues: QuestionEditFormDefaultValues;
  context: {
    materialId: string;
    chapterIds: string[];
  };
}

export interface QuestionEditFormPresenterProps {
  defaultValues: QuestionEditFormDefaultValues;
  answers: AnswerField[];
  status: FormState["status"];
  message?: string;
  isPending: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
  onAddAnswer: () => void;
  onAnswerChange: (id: string, value: string) => void;
  onRemoveAnswer: (id: string) => void;
  isRemoveDisabled: boolean;
}
