"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { materialKeys } from "@/features/materials/queries/keys";
import type { FormState } from "@/features/materials/types/formState";
import { createMaterialAction } from "./actions";

interface UseMaterialCreateFormResult {
  status: FormState["status"];
  message?: string;
  redirect?: string;
  isPending: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
}

export function useMaterialCreateForm(): UseMaterialCreateFormResult {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createMaterialAction(formData);
      if (result.status === "error") {
        throw new Error(result.message ?? "教材の作成に失敗しました。");
      }
      return result;
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: materialKeys.list(),
      });

      if (result.redirect) {
        router.push(result.redirect as Parameters<typeof router.push>[0]);
      }

      router.refresh();
    },
  });

  const handleSubmit = async (formData: FormData) => {
    await mutation.mutateAsync(formData);
  };

  const status: FormState["status"] = mutation.isSuccess
    ? "success"
    : mutation.isError
      ? "error"
      : "idle";

  const message =
    mutation.isError && mutation.error instanceof Error
      ? mutation.error.message
      : mutation.data?.message;

  return {
    status,
    message,
    redirect: mutation.data?.redirect,
    isPending: mutation.isPending,
    onSubmit: handleSubmit,
  };
}
