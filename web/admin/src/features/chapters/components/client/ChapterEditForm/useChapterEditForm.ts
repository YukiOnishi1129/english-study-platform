"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { chapterKeys } from "@/features/chapters/queries/keys";
import { materialKeys } from "@/features/materials/queries/keys";
import type { FormState } from "@/features/materials/types/formState";
import { updateChapterAction } from "./actions";
import type { ChapterEditFormProps } from "./types";

interface UseChapterEditFormResult {
  defaultValues: ChapterEditFormProps["defaultValues"];
  status: FormState["status"];
  message?: string;
  isPending: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
}

export function useChapterEditForm(
  props: ChapterEditFormProps,
): UseChapterEditFormResult {
  const router = useRouter();
  const queryClient = useQueryClient();
  const lastSubmittedNameRef = useRef<string>(props.defaultValues.name ?? "");

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateChapterAction(formData);
      if (result.status === "error") {
        throw new Error(result.message ?? "章の更新に失敗しました。");
      }
      return result;
    },
    onSuccess: async (result) => {
      const invalidateTasks = [
        queryClient.invalidateQueries({
          queryKey: materialKeys.detail(props.defaultValues.materialId),
        }),
        queryClient.invalidateQueries({
          queryKey: chapterKeys.detail(props.defaultValues.chapterId),
        }),
      ];

      if (props.defaultValues.parentChapterId) {
        invalidateTasks.push(
          queryClient.invalidateQueries({
            queryKey: chapterKeys.detail(props.defaultValues.parentChapterId),
          }),
        );
      }

      await Promise.all(invalidateTasks);

      if (result.redirect) {
        router.replace(result.redirect as Parameters<typeof router.push>[0]);
      }

      router.refresh();
      const chapterName =
        lastSubmittedNameRef.current || props.defaultValues.name || "章";
      toast.success(`章「${chapterName}」を更新しました。`);
      lastSubmittedNameRef.current = chapterName;
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
  } satisfies UseChapterEditFormResult;
}
