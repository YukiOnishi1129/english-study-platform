"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { materialKeys } from "@/features/materials/queries/keys";
import type { FormState } from "@/features/materials/types/formState";
import { updateMaterialAction } from "./actions";
import type { MaterialEditFormProps } from "./types";

interface UseMaterialEditFormResult {
  defaultValues: MaterialEditFormProps["defaultValues"];
  status: FormState["status"];
  message?: string;
  isPending: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
}

export function useMaterialEditForm(
  props: MaterialEditFormProps,
): UseMaterialEditFormResult {
  const router = useRouter();
  const queryClient = useQueryClient();
  const lastSubmittedNameRef = useRef<string>(props.defaultValues.name ?? "");

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateMaterialAction(formData);
      if (result.status === "error") {
        throw new Error(result.message ?? "教材の更新に失敗しました。");
      }
      return result;
    },
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: materialKeys.list() }),
        queryClient.invalidateQueries({
          queryKey: materialKeys.detail(props.defaultValues.materialId),
        }),
      ]);

      if (result.redirect) {
        router.replace(result.redirect as Parameters<typeof router.push>[0]);
      }

      router.refresh();
      const materialName =
        lastSubmittedNameRef.current || props.defaultValues.name || "教材";
      toast.success(`教材「${materialName}」を更新しました。`);
      lastSubmittedNameRef.current = materialName;
    },
  });

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      const nameEntry = formData.get("name");
      lastSubmittedNameRef.current =
        typeof nameEntry === "string" && nameEntry.trim().length > 0
          ? nameEntry.trim()
          : (props.defaultValues.name ?? "");
      await mutation.mutateAsync(formData);
    },
    [mutation, props.defaultValues.name],
  );

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
    defaultValues: props.defaultValues,
    status,
    message,
    isPending: mutation.isPending,
    onSubmit: handleSubmit,
  };
}
