"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      disabled={status.pending}
      className="inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-300"
    >
      {status.pending ? "追加中..." : "章を追加"}
    </button>
  );
}
