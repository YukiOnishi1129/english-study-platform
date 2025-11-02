"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { toast } from "sonner";
import { chapterKeys } from "@/features/chapters/queries/keys";
import { materialKeys } from "@/features/materials/queries/keys";
import { createUnitAction } from "./actions";
import type {
  UnitCreateFormPresenterProps,
  UnitCreateFormProps,
} from "./types";

export function useUnitCreateForm(
  props: UnitCreateFormProps,
): UnitCreateFormPresenterProps {
  const queryClient = useQueryClient();
  const router = useRouter();
  const lastSubmittedNameRef = useRef<string>("");

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createUnitAction(formData);
      if (result.status === "error") {
        throw new Error(result.message ?? "UNITの作成に失敗しました。");
      }
      return result;
    },
    onSuccess: async (result) => {
      const tasks = [
        queryClient.invalidateQueries({
          queryKey: materialKeys.detail(props.materialId),
        }),
        queryClient.invalidateQueries({
          queryKey: chapterKeys.detail(
            props.invalidateChapterId ?? props.chapterId,
          ),
        }),
      ];

      await Promise.all(tasks);

      const shouldRedirect = props.redirectToUnitDetail ?? true;

      if (shouldRedirect && result.redirect) {
        router.push(result.redirect as Parameters<typeof router.push>[0]);
      }

      router.refresh();
      const unitName = lastSubmittedNameRef.current || "新しいUNIT";
      toast.success(`UNIT「${unitName}」を追加しました。`);
      lastSubmittedNameRef.current = "";
    },
  });

  const handleSubmit = async (formData: FormData) => {
    const nameEntry = formData.get("name");
    lastSubmittedNameRef.current =
      typeof nameEntry === "string" ? nameEntry.trim() : "";
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
    chapterId: props.chapterId,
    chapterName: props.chapterName,
    materialId: props.materialId,
    status,
    message,
    isPending: mutation.isPending,
    onSubmit: handleSubmit,
  } satisfies UnitCreateFormPresenterProps;
}
