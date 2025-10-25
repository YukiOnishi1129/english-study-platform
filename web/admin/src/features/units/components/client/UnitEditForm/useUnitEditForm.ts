"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { chapterKeys } from "@/features/chapters/queries/keys";
import { materialKeys } from "@/features/materials/queries/keys";
import { unitKeys } from "@/features/units/queries/keys";
import { updateUnitAction } from "./actions";
import type { UnitEditFormPresenterProps, UnitEditFormProps } from "./types";

export function useUnitEditForm(
  props: UnitEditFormProps,
): UnitEditFormPresenterProps {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateUnitAction(formData);
      if (result.status === "error") {
        throw new Error(result.message ?? "UNITの更新に失敗しました。");
      }
      return result;
    },
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: materialKeys.detail(props.defaultValues.materialId),
        }),
        queryClient.invalidateQueries({
          queryKey: chapterKeys.detail(props.defaultValues.chapterId),
        }),
        queryClient.invalidateQueries({
          queryKey: unitKeys.detail(props.defaultValues.unitId),
        }),
      ]);

      if (result.redirect) {
        router.replace(result.redirect as Parameters<typeof router.push>[0]);
      }

      router.refresh();
    },
  });

  const handleSubmit = async (formData: FormData) => {
    await mutation.mutateAsync(formData);
  };

  const status = mutation.isSuccess
    ? "success"
    : mutation.isError
      ? "error"
      : "idle";

  const message = mutation.isError
    ? (mutation.error as Error).message
    : mutation.data?.message;

  return {
    defaultValues: props.defaultValues,
    status,
    message,
    isPending: mutation.isPending,
    onSubmit: handleSubmit,
  } satisfies UnitEditFormPresenterProps;
}
