"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { chapterKeys } from "@/features/chapters/queries/keys";
import { deleteQuestionsAction } from "@/features/materials/actions/deleteQuestionAction";
import { materialKeys } from "@/features/materials/queries/keys";
import { questionKeys } from "@/features/questions/queries/keys";
import { unitKeys } from "@/features/units/queries/keys";
import { useUnitDetailQuery } from "@/features/units/queries/useUnitDetailQuery";
import { UnitDetailContentPresenter } from "./UnitDetailContentPresenter";

interface UnitDetailContentProps {
  unitId: string;
}

interface BulkDeleteVariables {
  questionIds: string[];
  materialId: string;
  chapterIds: string[];
}

export function UnitDetailContent(props: UnitDetailContentProps) {
  const { unitId } = props;
  const { data, isLoading, isError } = useUnitDetailQuery(unitId);
  const queryClient = useQueryClient();

  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // Keep selection in sync with the latest data source
  useEffect(() => {
    if (!data?.questions) {
      setSelectedQuestionIds([]);
      return;
    }

    setSelectedQuestionIds((prev) =>
      prev.filter((questionId) =>
        data.questions.some((question) => question.id === questionId),
      ),
    );
  }, [data?.questions]);

  const handleToggleQuestionSelect = useCallback(
    (questionId: string, nextSelected: boolean) => {
      setSelectedQuestionIds((prev) => {
        if (nextSelected) {
          if (prev.includes(questionId)) {
            return prev;
          }
          return [...prev, questionId];
        }
        return prev.filter((id) => id !== questionId);
      });
    },
    [],
  );

  const handleToggleAllQuestions = useCallback(
    (nextSelected: boolean) => {
      if (!data?.questions) {
        setSelectedQuestionIds([]);
        return;
      }

      if (nextSelected) {
        setSelectedQuestionIds(data.questions.map((question) => question.id));
      } else {
        setSelectedQuestionIds([]);
      }
    },
    [data?.questions],
  );

  const bulkDeleteMutation = useMutation({
    mutationFn: async (variables: BulkDeleteVariables) => {
      const result = await deleteQuestionsAction({
        questionIds: variables.questionIds,
        unitId,
      });

      if (!result.success) {
        throw new Error(result.message ?? "問題の削除に失敗しました。");
      }

      return variables;
    },
    onSuccess: async (_returned, variables) => {
      const invalidateTasks = [
        queryClient.invalidateQueries({
          queryKey: unitKeys.detail(unitId),
        }),
        queryClient.invalidateQueries({
          queryKey: materialKeys.list(),
        }),
      ];

      if (variables.materialId) {
        invalidateTasks.push(
          queryClient.invalidateQueries({
            queryKey: materialKeys.detail(variables.materialId),
          }),
        );
      }

      variables.chapterIds.forEach((chapterId) => {
        invalidateTasks.push(
          queryClient.invalidateQueries({
            queryKey: chapterKeys.detail(chapterId),
          }),
        );
      });

      await Promise.all(invalidateTasks);

      // Invalidate cached question details that might still exist
      await Promise.all(
        variables.questionIds.map((questionId) =>
          queryClient.invalidateQueries({
            queryKey: questionKeys.detail(questionId),
          }),
        ),
      );

      setSelectedQuestionIds([]);

      toast.success(`${variables.questionIds.length}件の問題を削除しました。`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "問題の削除に失敗しました。再度お試しください。",
      );
    },
  });

  const handleBulkDelete = useCallback(() => {
    if (!data || selectedQuestionIds.length === 0) {
      return;
    }

    bulkDeleteMutation.mutate({
      questionIds: selectedQuestionIds,
      materialId: data.material.id,
      chapterIds: data.chapterPath.map((chapter) => chapter.id),
    });
  }, [bulkDeleteMutation, data, selectedQuestionIds]);

  return (
    <UnitDetailContentPresenter
      detail={data}
      isLoading={isLoading}
      isError={isError}
      selectedQuestionIds={selectedQuestionIds}
      isBulkDeleting={bulkDeleteMutation.isPending}
      onToggleQuestionSelect={handleToggleQuestionSelect}
      onToggleAllQuestions={handleToggleAllQuestions}
      onBulkDelete={handleBulkDelete}
    />
  );
}
