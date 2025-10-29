import { useCallback, useEffect, useMemo, useState } from "react";

import type { ReviewSessionDataDto } from "@/external/dto/review/review.session.dto";
import { submitUnitAnswerAction } from "@/external/handler/study/submit-unit-answer.command.action";

export type StudyStatus = "idle" | "correct" | "incorrect";

interface UseReviewStudySessionParams {
  session: ReviewSessionDataDto;
  initialQuestionId?: string;
}

export interface UseReviewStudySessionResult {
  hasQuestions: boolean;
  isCompleted: boolean;
  status: StudyStatus;
  isAnswered: boolean;
  encouragement: string;
  materialName: string;
  groupLabel: string;
  remainingCount: number;
  currentIndex: number;
  currentQuestion: ReviewSessionDataDto["questions"][number] | null;
  inputValue: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  isHintVisible: boolean;
  speakingAnswer: string | null;
  onInputChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onFillReferenceAnswer: () => void;
  onToggleHint: () => void;
  onRetryCurrent: () => void;
  onNextQuestion: () => void;
  onSpeakAnswer: (answer: string) => void;
}

function getGroupLabel(group: ReviewSessionDataDto["group"]): string {
  switch (group) {
    case "weak":
      return "正答率が低い問題";
    case "lowAttempts":
      return "解答回数が少ない問題";
    case "unattempted":
      return "未解答の問題";
    default:
      return "復習対象";
  }
}

function getEncouragement(status: StudyStatus): string {
  switch (status) {
    case "correct":
      return "素晴らしい！その調子です。";
    case "incorrect":
      return "気にせず次の問題に挑戦しましょう。";
    default:
      return "集中して復習を進めましょう。";
  }
}

export function useReviewStudySession({
  session,
  initialQuestionId,
}: UseReviewStudySessionParams): UseReviewStudySessionResult {
  const { questions } = session;

  const cloneQuestions = useCallback(
    (
      source: ReviewSessionDataDto["questions"],
    ): ReviewSessionDataDto["questions"] =>
      source.map((question) => ({ ...question })),
    [],
  );

  const initialIndex = useMemo(() => {
    if (!initialQuestionId) {
      return 0;
    }
    const index = questions.findIndex(
      (question) => question.questionId === initialQuestionId,
    );
    return index >= 0 ? index : 0;
  }, [questions, initialQuestionId]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<StudyStatus>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questionStates, setQuestionStates] = useState(() =>
    cloneQuestions(questions),
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [isHintVisible, setHintVisible] = useState(false);
  const [speakingAnswer, setSpeakingAnswer] = useState<string | null>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setInputValue("");
    setStatus("idle");
    setErrorMessage(null);
    setQuestionStates(cloneQuestions(questions));
    setIsCompleted(false);
    setHintVisible(false);
    setSpeakingAnswer(null);
  }, [cloneQuestions, initialIndex, questions]);

  const currentQuestion = questionStates[currentIndex] ?? null;
  const remainingCount = questionStates.length - currentIndex - 1;
  const isAnswered = status !== "idle";

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!currentQuestion || isSubmitting || !inputValue.trim()) {
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);
      try {
        const result = await submitUnitAnswerAction({
          unitId: currentQuestion.unitId,
          questionId: currentQuestion.questionId,
          answerText: inputValue,
        });

        setStatus(result.isCorrect ? "correct" : "incorrect");
        setQuestionStates((prev) => {
          const updatedLastAttemptedAt = result.statistics.lastAttemptedAt
            ? new Date(result.statistics.lastAttemptedAt)
            : null;

          return prev.map((item) =>
            item.questionId === currentQuestion.questionId
              ? {
                  ...item,
                  totalAttempts: result.statistics.totalAttempts,
                  correctCount: result.statistics.correctCount,
                  incorrectCount: result.statistics.incorrectCount,
                  accuracy: result.statistics.accuracy,
                  lastAttemptedAt: updatedLastAttemptedAt,
                }
              : item,
          );
        });
      } catch (_error) {
        setErrorMessage(
          "回答の送信に失敗しました。時間をおいて再度お試しください。",
        );
        setStatus("idle");
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentQuestion, inputValue, isSubmitting],
  );

  const handleNextQuestion = useCallback(() => {
    if (currentIndex >= questionStates.length - 1) {
      setIsCompleted(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setInputValue("");
    setStatus("idle");
    setErrorMessage(null);
    setHintVisible(false);
    setSpeakingAnswer(null);
  }, [currentIndex, questionStates.length]);

  const handleFillReferenceAnswer = useCallback(() => {
    if (!currentQuestion?.acceptableAnswers.length || isAnswered) {
      return;
    }
    setInputValue(currentQuestion.acceptableAnswers[0] ?? "");
  }, [currentQuestion, isAnswered]);

  const handleToggleHint = useCallback(() => {
    setHintVisible((prev) => !prev);
  }, []);

  const handleRetryCurrent = useCallback(() => {
    setInputValue("");
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
      setSpeakingAnswer(null);
    };
  }, []);

  const handleSpeakAnswer = useCallback((answer: string) => {
    if (typeof window === "undefined" || !answer) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.lang = "en-US";
    utterance.onend = () => setSpeakingAnswer(null);
    utterance.onerror = () => setSpeakingAnswer(null);
    window.speechSynthesis.cancel();
    setSpeakingAnswer(answer);
    window.speechSynthesis.speak(utterance);
  }, []);

  return {
    hasQuestions: questionStates.length > 0,
    isCompleted,
    status,
    isAnswered,
    encouragement: getEncouragement(status),
    materialName: session.material.name,
    groupLabel: getGroupLabel(session.group),
    remainingCount,
    currentIndex,
    currentQuestion,
    inputValue,
    isSubmitting,
    errorMessage,
    isHintVisible,
    speakingAnswer,
    onInputChange: setInputValue,
    onSubmit: handleSubmit,
    onFillReferenceAnswer: handleFillReferenceAnswer,
    onToggleHint: handleToggleHint,
    onRetryCurrent: handleRetryCurrent,
    onNextQuestion: handleNextQuestion,
    onSpeakAnswer: handleSpeakAnswer,
  };
}
