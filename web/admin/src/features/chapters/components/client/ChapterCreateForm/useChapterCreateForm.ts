"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { chapterKeys } from "@/features/chapters/queries/keys";
import { materialKeys } from "@/features/materials/queries/keys";
import type { FormState } from "@/features/materials/types/formState";
import { createChapterAction } from "./actions";

interface ChapterCreateFormParams {
  materialId: string;
  parentChapterId?: string;
  parentChapterName?: string;
  invalidateChapterId?: string;
}

interface UseChapterCreateFormResult {
  materialId: string;
  parentChapterId?: string;
  parentChapterName?: string;
  contextLabel: string;
  status: FormState["status"];
  message?: string;
  isPending: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
}

export function useChapterCreateForm(
  props: ChapterCreateFormParams,
): UseChapterCreateFormResult {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createChapterAction(formData);
      if (result.status === "error") {
        throw new Error(result.message ?? "章の作成に失敗しました。");
      }
      return result;
    },
    onSuccess: async (result) => {
      const tasks = [
        queryClient.invalidateQueries({
          queryKey: materialKeys.detail(props.materialId),
        }),
      ];

      if (props.invalidateChapterId) {
        tasks.push(
          queryClient.invalidateQueries({
            queryKey: chapterKeys.detail(props.invalidateChapterId),
          }),
        );
      }

      await Promise.all(tasks);

      if (result.redirect) {
        router.push(result.redirect as Parameters<typeof router.push>[0]);
      }

      router.refresh();
    },
  });

  const handleSubmit = async (formData: FormData) => {
    await mutation.mutateAsync(formData);
  };

  const contextLabel = useMemo(() => {
    if (props.parentChapterId && props.parentChapterName) {
      return `「${props.parentChapterName}」の下に章を追加`;
    }
    return "新しい章を追加";
  }, [props.parentChapterId, props.parentChapterName]);

  return {
    materialId: props.materialId,
    parentChapterId: props.parentChapterId,
    parentChapterName: props.parentChapterName,
    contextLabel,
    status: mutation.isSuccess
      ? "success"
      : mutation.isError
        ? "error"
        : "idle",
    message: mutation.isError
      ? (mutation.error as Error).message
      : mutation.data?.message,
    isPending: mutation.isPending,
    onSubmit: handleSubmit,
  };
}
