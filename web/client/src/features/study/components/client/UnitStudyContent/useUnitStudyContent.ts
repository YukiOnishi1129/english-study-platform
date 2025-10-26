"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { UnitDetailDto } from "@/external/dto/unit/unit.query.dto";
import { submitUnitAnswerAction } from "@/external/handler/study/submit-unit-answer.command.action";
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
  material: UnitDetailDto["material"] | null;
  breadcrumb: UnitStudyBreadcrumbItem[];
  questionCount: number;
  answeredCount: number;
  correctCount: number;
  accuracyRate: number | null;
  currentIndex: number;
  progressLabel: string;
  currentQuestion: UnitStudyQuestionViewModel | null;
  currentStatistics: UnitStudyQuestionStatisticsViewModel | null;
  inputValue: string;
  status: StudyStatus;
  isHintVisible: boolean;
  isAnswerVisible: boolean;
  errorMessage: string | null;
  onInputChange: (value: string) => void;
  onToggleHint: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onNext: () => void;
  onReset: () => void;
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
  const { data, isLoading, isError } = useUnitDetailQuery(unitId, accountId);

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

  const progressLabel =
    questionCount > 0 ? `${currentIndex + 1} / ${questionCount}` : "0 / 0";
  const accuracyRate =
    answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : null;

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

  const moveToNextQuestion = useCallback(() => {
    if (questionCount === 0) {
      return;
    }
    setCurrentIndex((prev) => (prev + 1) % questionCount);
    resetStateForNextQuestion();
  }, [questionCount, resetStateForNextQuestion]);

  const handleNext = useCallback(() => {
    moveToNextQuestion();
  }, [moveToNextQuestion]);

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

  return {
    isLoading,
    isError,
    isSubmitting: submitAnswer.isPending,
    unit: data?.unit ?? null,
    material: data?.material ?? null,
    breadcrumb: buildBreadcrumb(data ?? null),
    questionCount,
    answeredCount,
    correctCount,
    accuracyRate,
    currentIndex,
    progressLabel,
    currentQuestion,
    currentStatistics,
    inputValue,
    status,
    isHintVisible,
    isAnswerVisible,
    errorMessage,
    onInputChange: handleInputChange,
    onToggleHint: () => setHintVisible((prev) => !prev),
    onSubmit: handleSubmit,
    onNext: handleNext,
    onReset: handleReset,
  };
}
