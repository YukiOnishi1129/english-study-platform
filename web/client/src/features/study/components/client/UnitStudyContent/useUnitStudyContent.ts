"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { MaterialDetailDto } from "@/external/dto/material/material.detail.dto";
import type { UnitDetailDto } from "@/external/dto/unit/unit.query.dto";
import { submitUnitAnswerAction } from "@/external/handler/study/submit-unit-answer.command.action";
import { useMaterialDetailQuery } from "@/features/materials/queries";
import { unitKeys } from "@/features/units/queries/keys";
import { useUnitDetailQuery } from "@/features/units/queries/useUnitDetailQuery";

interface UseUnitStudyContentOptions {
  unitId: string;
  accountId: string | null;
}

export interface UnitStudyBreadcrumbItem {
  id: string;
  label: string;
  href: string | null;
}

export interface UnitStudyQuestionStatisticsViewModel {
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  lastAttemptedAt: string | null;
}

export interface UnitStudyQuestionViewModel {
  id: string;
  title: string;
  japanese: string;
  hint: string | null;
  explanation: string | null;
  acceptableAnswers: string[];
  statistics: UnitStudyQuestionStatisticsViewModel | null;
}

type StudyStatus = "idle" | "correct" | "incorrect";

export interface UseUnitStudyContentResult {
  isLoading: boolean;
  isError: boolean;
  isSubmitting: boolean;
  unit: UnitDetailDto["unit"] | null;
  materialDetail: MaterialDetailDto | null;
  material: UnitDetailDto["material"] | null;
  breadcrumb: UnitStudyBreadcrumbItem[];
  questionCount: number;
  answeredCount: number;
  correctCount: number;
  accuracyRate: number | null;
  currentIndex: number;
  progressLabel: string;
  questions: UnitStudyQuestionViewModel[];
  currentQuestion: UnitStudyQuestionViewModel | null;
  currentQuestionId: string | null;
  currentStatistics: UnitStudyQuestionStatisticsViewModel | null;
  inputValue: string;
  status: StudyStatus;
  isHintVisible: boolean;
  isAnswerVisible: boolean;
  errorMessage: string | null;
  accountId: string | null;
  onInputChange: (value: string) => void;
  onToggleHint: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onNext: () => void;
  onReset: () => void;
  onRetryCurrent: () => void;
  onSelectQuestion: (questionId: string) => void;
  onNavigateUnit: (unitId: string, questionId?: string) => void;
}

function buildBreadcrumb(
  detail: UnitDetailDto | null,
): UnitStudyBreadcrumbItem[] {
  if (!detail) {
    return [];
  }

  const items: UnitStudyBreadcrumbItem[] = [
    {
      id: detail.material.id,
      label: detail.material.name,
      href: `/materials/${detail.material.id}`,
    },
  ];

  detail.chapterPath.forEach((chapter) => {
    items.push({
      id: chapter.id,
      label: chapter.name,
      href: null,
    });
  });

  items.push({
    id: detail.unit.id,
    label: detail.unit.name,
    href: `/units/${detail.unit.id}`,
  });

  items.push({
    id: `${detail.unit.id}-study`,
    label: "学習",
    href: null,
  });

  return items;
}

function mapStatistics(
  stats: UnitDetailDto["questions"][number]["statistics"],
): UnitStudyQuestionStatisticsViewModel | null {
  if (!stats) {
    return null;
  }

  return {
    totalAttempts: stats.totalAttempts,
    correctCount: stats.correctCount,
    incorrectCount: stats.incorrectCount,
    accuracy: stats.accuracy,
    lastAttemptedAt: stats.lastAttemptedAt,
  };
}

interface SubmitUnitAnswerVariables {
  unitId: string;
  questionId: string;
  answerText: string;
}

interface SubmitUnitAnswerResult {
  isCorrect: boolean;
  statistics: {
    totalAttempts: number;
    correctCount: number;
    incorrectCount: number;
    accuracy: number;
    lastAttemptedAt: string | null;
  };
}

export function useUnitStudyContent(
  options: UseUnitStudyContentOptions,
): UseUnitStudyContentResult {
  const { unitId, accountId } = options;
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data, isLoading, isError } = useUnitDetailQuery(unitId, accountId);
  const { data: materialDetail } = useMaterialDetailQuery(
    data?.material.id ?? null,
    accountId ?? null,
  );

  const questions = useMemo<UnitStudyQuestionViewModel[]>(() => {
    if (!data) {
      return [];
    }

    return data.questions
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((question) => ({
        id: question.id,
        title: `Q${question.order}`,
        japanese: question.japanese,
        hint: question.hint,
        explanation: question.explanation,
        acceptableAnswers: question.correctAnswers.map(
          (answer) => answer.answerText,
        ),
        statistics: mapStatistics(question.statistics),
      }));
  }, [data]);

  const [questionStatisticsMap, setQuestionStatisticsMap] = useState<
    Record<string, UnitStudyQuestionStatisticsViewModel | null>
  >({});

  useEffect(() => {
    if (!data) {
      setQuestionStatisticsMap({});
      return;
    }

    const next: Record<string, UnitStudyQuestionStatisticsViewModel | null> =
      {};
    data.questions.forEach((question) => {
      next[question.id] = mapStatistics(question.statistics);
    });
    setQuestionStatisticsMap(next);
  }, [data]);

  const questionCount = questions.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<StudyStatus>("idle");
  const [isHintVisible, setHintVisible] = useState(false);
  const [isAnswerVisible, setAnswerVisible] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const initializedFromQueryRef = useRef(false);
  const lastSyncedQuestionIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (questionCount === 0) {
      setCurrentIndex(0);
      setInputValue("");
      setStatus("idle");
      setHintVisible(false);
      setAnswerVisible(false);
      setAnsweredCount(0);
      setCorrectCount(0);
      setErrorMessage(null);
      return;
    }

    if (currentIndex >= questionCount) {
      setCurrentIndex(0);
      setStatus("idle");
      setHintVisible(false);
      setAnswerVisible(false);
      setInputValue("");
    }
  }, [questionCount, currentIndex]);

  const currentQuestion = questions[currentIndex] ?? null;
  const currentStatistics = currentQuestion
    ? (questionStatisticsMap[currentQuestion.id] ?? null)
    : null;

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const resetStateForNextQuestion = useCallback(() => {
    setInputValue("");
    setStatus("idle");
    setHintVisible(false);
    setAnswerVisible(false);
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    if (initializedFromQueryRef.current) {
      return;
    }

    if (!searchParams) {
      initializedFromQueryRef.current = true;
      return;
    }

    const requestedQuestionId = searchParams.get("questionId");
    if (!requestedQuestionId) {
      initializedFromQueryRef.current = true;
      return;
    }

    const index = questions.findIndex(
      (question) => question.id === requestedQuestionId,
    );
    if (index >= 0) {
      setCurrentIndex(index);
      resetStateForNextQuestion();
    }
    initializedFromQueryRef.current = true;
  }, [questions, resetStateForNextQuestion, searchParams]);

  useEffect(() => {
    const currentId = currentQuestion?.id ?? null;
    if (lastSyncedQuestionIdRef.current === currentId) {
      return;
    }
    lastSyncedQuestionIdRef.current = currentId;

    const nextUrl = (
      currentId !== null ? `${pathname}?questionId=${currentId}` : pathname
    ) as Route;
    router.replace(nextUrl, { scroll: false });
  }, [currentQuestion?.id, pathname, router]);

  const nextUnitId = useMemo(() => {
    if (!materialDetail) {
      return null;
    }
    const orderedUnitIds = materialDetail.chapters.flatMap((chapter) =>
      chapter.units.map((unit) => unit.id),
    );
    const current = orderedUnitIds.indexOf(unitId);
    if (current === -1) {
      return null;
    }
    return orderedUnitIds[current + 1] ?? null;
  }, [materialDetail, unitId]);

  useEffect(() => {
    if (!nextUnitId) {
      return;
    }
    router.prefetch(`/units/${nextUnitId}/study`);
  }, [nextUnitId, router]);

  const progressLabel =
    questionCount > 0 ? `${currentIndex + 1} / ${questionCount}` : "0 / 0";
  const accuracyRate =
    answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : null;

  const moveToNextQuestion = useCallback(() => {
    if (questionCount === 0) {
      return;
    }
    setCurrentIndex((prev) => (prev + 1) % questionCount);
    resetStateForNextQuestion();
  }, [questionCount, resetStateForNextQuestion]);

  const handleNext = useCallback(() => {
    if (questionCount === 0) {
      return;
    }
    const isLastQuestion = currentIndex >= questionCount - 1;
    if (isLastQuestion && nextUnitId) {
      router.push(`/units/${nextUnitId}/study`);
      return;
    }
    moveToNextQuestion();
  }, [currentIndex, moveToNextQuestion, nextUnitId, questionCount, router]);

  const submitAnswer = useMutation({
    mutationFn: async (
      variables: SubmitUnitAnswerVariables,
    ): Promise<SubmitUnitAnswerResult> => submitUnitAnswerAction(variables),
  });

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!currentQuestion) {
        return;
      }

      if (status !== "idle") {
        return;
      }

      const trimmed = inputValue.trim();
      if (!trimmed) {
        setStatus("idle");
        return;
      }

      try {
        const result = await submitAnswer.mutateAsync({
          unitId,
          questionId: currentQuestion.id,
          answerText: trimmed,
        });

        setStatus(result.isCorrect ? "correct" : "incorrect");
        setAnswerVisible(true);
        setAnsweredCount((prev) => prev + 1);
        if (result.isCorrect) {
          setCorrectCount((prev) => prev + 1);
        }
        setErrorMessage(null);

        const statsViewModel: UnitStudyQuestionStatisticsViewModel = {
          totalAttempts: result.statistics.totalAttempts,
          correctCount: result.statistics.correctCount,
          incorrectCount: result.statistics.incorrectCount,
          accuracy: result.statistics.accuracy,
          lastAttemptedAt: result.statistics.lastAttemptedAt,
        };

        setQuestionStatisticsMap((prev) => ({
          ...prev,
          [currentQuestion.id]: statsViewModel,
        }));

        queryClient.setQueryData<UnitDetailDto | undefined>(
          unitKeys.detail(unitId, accountId ?? null),
          (prev) => {
            if (!prev) {
              return prev;
            }
            return {
              ...prev,
              questions: prev.questions.map((question) =>
                question.id === currentQuestion.id
                  ? {
                      ...question,
                      statistics: {
                        totalAttempts: statsViewModel.totalAttempts,
                        correctCount: statsViewModel.correctCount,
                        incorrectCount: statsViewModel.incorrectCount,
                        accuracy: statsViewModel.accuracy,
                        lastAttemptedAt: statsViewModel.lastAttemptedAt,
                      },
                    }
                  : question,
              ),
            };
          },
        );
      } catch (error) {
        console.error("Failed to submit answer", error);
        setErrorMessage(
          "解答の送信に失敗しました。時間をおいて再度お試しください。",
        );
        setStatus("idle");
        setAnswerVisible(false);
      }
    },
    [
      accountId,
      currentQuestion,
      inputValue,
      queryClient,
      status,
      submitAnswer,
      unitId,
    ],
  );

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setAnsweredCount(0);
    setCorrectCount(0);
    resetStateForNextQuestion();
  }, [resetStateForNextQuestion]);

  const handleRetryCurrent = useCallback(() => {
    resetStateForNextQuestion();
  }, [resetStateForNextQuestion]);

  const handleSelectQuestion = useCallback(
    (questionId: string) => {
      const index = questions.findIndex(
        (question) => question.id === questionId,
      );
      if (index === -1) {
        return;
      }
      setCurrentIndex(index);
      resetStateForNextQuestion();
    },
    [questions, resetStateForNextQuestion],
  );

  const handleNavigateUnit = useCallback(
    (targetUnitId: string, targetQuestionId?: string) => {
      if (targetUnitId === unitId) {
        if (targetQuestionId) {
          handleSelectQuestion(targetQuestionId);
        }
        return;
      }
      const search = targetQuestionId ? `?questionId=${targetQuestionId}` : "";
      router.push(`/units/${targetUnitId}/study${search}` as Route);
    },
    [handleSelectQuestion, router, unitId],
  );

  return {
    isLoading,
    isError,
    isSubmitting: submitAnswer.isPending,
    unit: data?.unit ?? null,
    materialDetail: materialDetail ?? null,
    material: data?.material ?? null,
    breadcrumb: buildBreadcrumb(data ?? null),
    questionCount,
    answeredCount,
    correctCount,
    accuracyRate,
    currentIndex,
    progressLabel,
    questions,
    currentQuestion,
    currentQuestionId: currentQuestion?.id ?? null,
    currentStatistics,
    inputValue,
    status,
    isHintVisible,
    isAnswerVisible,
    errorMessage,
    accountId,
    onInputChange: handleInputChange,
    onToggleHint: () => setHintVisible((prev) => !prev),
    onSubmit: handleSubmit,
    onNext: handleNext,
    onReset: handleReset,
    onRetryCurrent: handleRetryCurrent,
    onSelectQuestion: handleSelectQuestion,
    onNavigateUnit: handleNavigateUnit,
  };
}
