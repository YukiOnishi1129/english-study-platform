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
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues: QuestionEditFormDefaultValues;
}

export interface QuestionEditFormPresenterProps {
  formAction: (formData: FormData) => void;
  state: FormState;
  defaultValues: QuestionEditFormDefaultValues;
  answers: AnswerField[];
  onAddAnswer: () => void;
  onAnswerChange: (id: string, value: string) => void;
  onRemoveAnswer: (id: string) => void;
  isRemoveDisabled: boolean;
}
