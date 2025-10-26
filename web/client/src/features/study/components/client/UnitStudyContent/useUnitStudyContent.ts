"use client";

import type * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { UnitDetailDto } from "@/external/dto/unit/unit.query.dto";
import { useUnitDetailQuery } from "@/features/units/queries/useUnitDetailQuery";

interface UseUnitStudyContentOptions {
  unitId: string;
}

export interface UnitStudyBreadcrumbItem {
  id: string;
  label: string;
  href: string | null;
}

export interface UnitStudyQuestionViewModel {
  id: string;
  title: string;
  japanese: string;
  hint: string | null;
  explanation: string | null;
  acceptableAnswers: string[];
}

type StudyStatus = "idle" | "correct" | "incorrect";

export interface UseUnitStudyContentResult {
  isLoading: boolean;
  isError: boolean;
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
  inputValue: string;
  status: StudyStatus;
  isHintVisible: boolean;
  isAnswerVisible: boolean;
  onInputChange: (value: string) => void;
  onToggleHint: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onRevealAnswer: () => void;
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

function normalizeAnswer(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function useUnitStudyContent(
  options: UseUnitStudyContentOptions,
): UseUnitStudyContentResult {
  const { unitId } = options;
  const { data, isLoading, isError } = useUnitDetailQuery(unitId);

  const questions = useMemo<UnitStudyQuestionViewModel[]>(() => {
    if (!data) {
      return [];
    }

    return data.questions.map((question) => ({
      id: question.id,
      title: `Q${question.order}`,
      japanese: question.japanese,
      hint: question.hint,
      explanation: question.explanation,
      acceptableAnswers: question.correctAnswers.map(
        (answer) => answer.answerText,
      ),
    }));
  }, [data]);

  const questionCount = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<StudyStatus>("idle");
  const [isHintVisible, setHintVisible] = useState(false);
  const [isAnswerVisible, setAnswerVisible] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    if (questionCount === 0) {
      setCurrentIndex(0);
      setInputValue("");
      setStatus("idle");
      setHintVisible(false);
      setAnswerVisible(false);
      setAnsweredCount(0);
      setCorrectCount(0);
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
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!currentQuestion) {
        return;
      }

      const normalizedInput = normalizeAnswer(inputValue);
      if (!normalizedInput) {
        setStatus("idle");
        return;
      }

      const isCorrect = currentQuestion.acceptableAnswers.some(
        (answer) => normalizeAnswer(answer) === normalizedInput,
      );

      setStatus(isCorrect ? "correct" : "incorrect");
      setAnswerVisible(true);
      setAnsweredCount((prev) => prev + 1);
      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
      }
    },
    [currentQuestion, inputValue],
  );

  const handleReveal = useCallback(() => {
    if (!currentQuestion) {
      return;
    }
    setStatus("incorrect");
    setAnswerVisible(true);
    setAnsweredCount((prev) => (status === "idle" ? prev + 1 : prev));
  }, [currentQuestion, status]);

  const handleNext = useCallback(() => {
    if (questionCount === 0) {
      return;
    }
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      return nextIndex >= questionCount ? 0 : nextIndex;
    });
    resetStateForNextQuestion();
  }, [questionCount, resetStateForNextQuestion]);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setAnsweredCount(0);
    setCorrectCount(0);
    resetStateForNextQuestion();
  }, [resetStateForNextQuestion]);

  return {
    isLoading,
    isError,
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
    inputValue,
    status,
    isHintVisible,
    isAnswerVisible,
    onInputChange: handleInputChange,
    onToggleHint: () => setHintVisible((prev) => !prev),
    onSubmit: handleSubmit,
    onRevealAnswer: handleReveal,
    onNext: handleNext,
    onReset: handleReset,
  };
}
