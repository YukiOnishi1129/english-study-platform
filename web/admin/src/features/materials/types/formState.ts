export type FormStatus = "idle" | "success" | "error";

export type FormRedirect =
  | `/materials/${string}`
  | `/materials/${string}/edit`
  | `/chapters/${string}`
  | `/chapters/${string}/edit`
  | `/units/${string}`
  | `/units/${string}/edit`
  | `/questions/${string}`
  | `/questions/${string}/edit`;

export interface FormState {
  status: FormStatus;
  message?: string;
  redirect?: FormRedirect;
}

export const initialFormState: FormState = {
  status: "idle",
};
