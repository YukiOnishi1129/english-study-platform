export type FormStatus = "idle" | "success" | "error";

export type FormRedirect =
  | `/materials/${string}`
  | `/materials/${string}/chapters/${string}`
  | `/materials/${string}/chapters/${string}/units/${string}`;

export interface FormState {
  status: FormStatus;
  message?: string;
  redirect?: FormRedirect;
}

export const initialFormState: FormState = {
  status: "idle",
};
