"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import type { MaterialDetailDto } from "@/external/dto/material/material.detail.dto";
import type {
  StudyMode,
  SubmitUnitAnswerResponse,
} from "@/external/dto/study/submit-unit-answer.dto";
import type { UnitDetailDto } from "@/external/dto/unit/unit.query.dto";
import { submitUnitAnswerAction } from "@/external/handler/study/submit-unit-answer.command.action";
import { useMaterialDetailQuery } from "@/features/materials/queries";
import { unitKeys } from "@/features/units/queries/keys";
import { useUnitDetailQuery } from "@/features/units/queries/useUnitDetailQuery";
import {
  buildBreadcrumb,
  buildMaterialDetail,
  buildUnit,
  mapStatistics,
} from "./utils";

const FALLBACK_STUDY_MODE: StudyMode = "jp_to_en";

interface UseUnitStudyContentOptions {
  unitId: string;
  accountId: string | null;
  initialPreferredMode?: StudyMode | null;
}

export interface UnitStudyBreadcrumbItem {
  id: string;
  label: string;
  href: string | null;
}

export interface UnitStudyModeStatisticsViewModel {
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  lastAttemptedAt: string | null;
}

export interface UnitStudyQuestionStatisticsViewModel
  extends UnitStudyModeStatisticsViewModel {
  byMode: Partial<Record<StudyMode, UnitStudyModeStatisticsViewModel>>;
}

export interface UnitStudyQuestionViewModel {
  id: string;
  title: string;
  variant: string;
  japanese: string;
  annotation: string | null;
  promptText: string;
  promptNote: string | null;
  sentencePromptJa: string | null;
  sentenceTargetWord: string | null;
  hint: string | null;
  explanation: string | null;
  acceptableAnswers: string[];
  vocabulary: UnitDetailDto["questions"][number]["vocabulary"];
  headword: string | null;
  answerLabel: string;
  answerPlaceholder: string;
  navigatorLabel: string;
  definitionJa: string | null;
  statistics: UnitStudyQuestionStatisticsViewModel | null;
  activeModeStatistics: UnitStudyModeStatisticsViewModel | null;
  availableModes: StudyMode[];
  defaultMode: StudyMode;
  activeMode: StudyMode;
}

interface UnitStudyQuestionBase {
  id: string;
  order: number;
  source: UnitDetailDto["questions"][number];
  availableModes: StudyMode[];
  defaultMode: StudyMode;
}

type StudyStatus = "idle" | "correct" | "incorrect";

function getAvailableModes(
  question: UnitDetailDto["questions"][number],
): StudyMode[] {
  if (question.vocabulary?.definitionJa) {
    const modes: StudyMode[] = ["en_to_jp", "jp_to_en"];
    if (question.vocabulary.exampleSentenceEn) {
      modes.push("sentence");
    }
    return modes;
  }
  return [FALLBACK_STUDY_MODE];
}

function resolveQuestionView(
  base: UnitStudyQuestionBase,
  mode: StudyMode,
): UnitStudyQuestionViewModel {
  const effectiveMode = base.availableModes.includes(mode)
    ? mode
    : base.defaultMode;

  const data = base.source;
  const vocabulary = data.vocabulary ?? null;
  const baseAcceptableAnswers = data.correctAnswers.map(
    (answer) => answer.answerText,
  );

  const relationHintParts: string[] = [];
  if (vocabulary?.synonyms?.length) {
    relationHintParts.push(`類義語: ${vocabulary.synonyms.join(" / ")}`);
  }
  if (vocabulary?.antonyms?.length) {
    relationHintParts.push(`対義語: ${vocabulary.antonyms.join(" / ")}`);
  }
  if (vocabulary?.relatedWords?.length) {
    relationHintParts.push(`関連語: ${vocabulary.relatedWords.join(" / ")}`);
  }

  let promptText = data.japanese;
  let navigatorLabel = data.japanese;
  let answerLabel = "回答を入力してみよう";
  let answerPlaceholder = "例: 回答を入力";
  const promptNote =
    data.prompt && data.prompt.trim().length > 0 ? data.prompt.trim() : null;
  let sentencePromptJa: string | null = null;
  let sentenceTargetWord: string | null = null;

  const manualHint =
    data.hint && data.hint.trim().length > 0 ? data.hint.trim() : null;
  const relationsText = relationHintParts.join("\n");
  const derivedHint = relationsText
    ? manualHint
      ? `${manualHint}\n${relationsText}`
      : relationsText
    : manualHint;

  let acceptableAnswers = baseAcceptableAnswers;

  if (effectiveMode === "jp_to_en") {
    promptText = data.japanese;
    navigatorLabel = data.japanese;
    answerLabel = vocabulary ? "英単語で答えてみよう" : "英語で答えてみよう";
    answerPlaceholder = "例: 英単語を入力";
    acceptableAnswers = baseAcceptableAnswers;
  } else if (effectiveMode === "en_to_jp") {
    promptText = data.headword ?? baseAcceptableAnswers[0] ?? data.japanese;
    navigatorLabel = promptText;
    answerLabel = "日本語訳を入力してみよう";
    answerPlaceholder = "例: 日本語訳を入力";
    const candidates: string[] = [];
    if (vocabulary?.definitionJa) {
      const parts = vocabulary.definitionJa
        .split(/[/、,・]/)
        .map((value) => value.trim())
        .filter(Boolean);
      candidates.push(...parts);
    }
    if (vocabulary?.memo) {
      const parts = vocabulary.memo
        .split(/[/、,・]/)
        .map((value) => value.trim())
        .filter(Boolean);
      candidates.push(...parts);
    }
    if (candidates.length === 0) {
      candidates.push(data.japanese);
    }
    acceptableAnswers = candidates;
  } else if (effectiveMode === "sentence") {
    const sentenceJapanese =
      vocabulary?.exampleSentenceJa &&
      vocabulary.exampleSentenceJa.trim().length > 0
        ? vocabulary.exampleSentenceJa.trim()
        : data.japanese;
    const targetHeadword =
      vocabulary?.headword ?? data.headword ?? baseAcceptableAnswers[0] ?? "";
    promptText = sentenceJapanese;
    navigatorLabel = targetHeadword || promptText;
    sentencePromptJa = sentenceJapanese;
    sentenceTargetWord =
      targetHeadword.trim().length > 0 ? targetHeadword : null;
    answerLabel = "例文を英語で入力";
    answerPlaceholder = "例: This is a pen.";
    acceptableAnswers = vocabulary?.exampleSentenceEn
      ? [vocabulary.exampleSentenceEn]
      : baseAcceptableAnswers;
  }

  const statistics = mapStatistics(data.statistics, data.modeStatistics);
  const activeModeStatistics = statistics?.byMode?.[effectiveMode] ?? null;

  return {
    id: base.id,
    title: `Q${base.order}`,
    variant: data.variant,
    japanese: data.japanese,
    promptText,
    promptNote,
    sentencePromptJa,
    sentenceTargetWord,
    hint: derivedHint,
    explanation: data.explanation,
    acceptableAnswers,
    vocabulary,
    headword: data.headword,
    answerLabel,
    answerPlaceholder,
    navigatorLabel,
    annotation: data.annotation,
    definitionJa: vocabulary?.definitionJa ?? data.japanese,
    statistics,
    activeModeStatistics,
    availableModes: base.availableModes,
    defaultMode: base.defaultMode,
    activeMode: effectiveMode,
  };
}

interface SubmitUnitAnswerVariables {
  unitId: string;
  questionId: string;
  answerText: string;
  mode: StudyMode;
}

interface SubmitUnitAnswerResult {
  isCorrect: boolean;
  statistics: SubmitUnitAnswerResponse["statistics"];
  modeStatistics?: SubmitUnitAnswerResponse["modeStatistics"];
}

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
  availableModes: StudyMode[];
  selectedMode: StudyMode;
  currentStatistics: UnitStudyQuestionStatisticsViewModel | null;
  currentModeStatistics: UnitStudyModeStatisticsViewModel | null;
  inputValue: string;
  status: StudyStatus;
  isHintVisible: boolean;
  isAnswerVisible: boolean;
  errorMessage: string | null;
  accountId: string | null;
  answerInputId: string;
  speakingAnswer: string | null;
  isAnswered: boolean;
  disableSubmit: boolean;
  disableNext: boolean;
  encouragement: string;
  statusLabel: string;
  remainingCount: number;
  isLastQuestion: boolean;
  onInputChange: (value: string) => void;
  onToggleHint: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onNext: () => void;
  onReset: () => void;
  onRetryCurrent: () => void;
  onSelectQuestion: (questionId: string) => void;
  onNavigateUnit: (unitId: string, questionId?: string) => void;
  onChangeMode: (mode: StudyMode) => void;
  onSpeakAnswer: (answer: string) => void;
}

export function useUnitStudyContent(
  options: UseUnitStudyContentOptions,
): UseUnitStudyContentResult {
  const { unitId, accountId, initialPreferredMode = null } = options;
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data, isLoading, isError } = useUnitDetailQuery(unitId, accountId);
  const { data: materialDetail } = useMaterialDetailQuery(
    data?.material.id ?? null,
    accountId ?? null,
  );

  const baseQuestions = useMemo<UnitStudyQuestionBase[]>(() => {
    if (!data) {
      return [];
    }

    return data.questions
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((question) => {
        const availableModes = getAvailableModes(question);
        const defaultMode = availableModes[0];
        return {
          id: question.id,
          order: question.order,
          source: question,
          availableModes,
          defaultMode,
        };
      });
  }, [data]);

  const [modeByQuestion, setModeByQuestion] = useState<
    Record<string, StudyMode>
  >({});
  const [preferredMode, setPreferredMode] = useState<StudyMode | null>(
    initialPreferredMode,
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<StudyStatus>("idle");
  const [isHintVisible, setHintVisible] = useState(false);
  const [isAnswerVisible, setAnswerVisible] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const initializedFromQueryRef = useRef(false);
  const answerInputId = useId();
  const [speakingAnswer, setSpeakingAnswer] = useState<string | null>(null);
  const lastSyncedQuestionIdRef = useRef<string | null>(null);

  const resolvedQuestions = useMemo<UnitStudyQuestionViewModel[]>(
    () =>
      baseQuestions.map((question) => {
        const selectedMode =
          modeByQuestion[question.id] ??
          (preferredMode && question.availableModes.includes(preferredMode)
            ? preferredMode
            : question.defaultMode);
        return resolveQuestionView(question, selectedMode);
      }),
    [baseQuestions, modeByQuestion, preferredMode],
  );

  useEffect(() => {
    const current = baseQuestions[currentIndex];
    if (!current) {
      return;
    }
    setModeByQuestion((prev) => {
      if (prev[current.id]) {
        return prev;
      }
      const candidate =
        preferredMode && current.availableModes.includes(preferredMode)
          ? preferredMode
          : current.defaultMode;
      return { ...prev, [current.id]: candidate };
    });
  }, [baseQuestions, currentIndex, preferredMode]);

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
      next[question.id] = mapStatistics(
        question.statistics,
        question.modeStatistics,
      );
    });
    setQuestionStatisticsMap(next);
  }, [data]);

  const questionCount = baseQuestions.length;
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

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
        setSpeakingAnswer(null);
      }
    };
  }, []);

  const currentBaseQuestion = baseQuestions[currentIndex] ?? null;
  const currentMode: StudyMode | null = currentBaseQuestion
    ? (() => {
        const storedMode = modeByQuestion[currentBaseQuestion.id];
        if (storedMode) {
          return storedMode;
        }
        if (
          preferredMode &&
          currentBaseQuestion.availableModes.includes(preferredMode)
        ) {
          return preferredMode;
        }
        return currentBaseQuestion.defaultMode;
      })()
    : null;
  const currentQuestion =
    currentBaseQuestion && currentMode
      ? resolveQuestionView(currentBaseQuestion, currentMode)
      : null;
  const currentStatistics = currentQuestion
    ? (questionStatisticsMap[currentQuestion.id] ?? null)
    : null;
  const currentModeStatistics =
    currentMode && currentStatistics
      ? (currentStatistics.byMode?.[currentMode] ?? null)
      : (currentQuestion?.activeModeStatistics ?? null);

  const isAnswered = status !== "idle";
  const encouragement =
    status === "correct"
      ? "やったね！その調子 🎉"
      : status === "incorrect"
        ? "大丈夫、もう一度チャレンジしよう 💪"
        : "準備はいい？さあ問題に挑戦！✨";
  const statusLabel =
    status === "correct"
      ? "正解です！"
      : status === "incorrect"
        ? "また挑戦してみよう"
        : "解答を待っています";
  const remainingCount = questionCount - currentIndex - 1;
  const _isLastQuestion =
    questionCount > 0 && currentIndex >= questionCount - 1;

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const resetStateForNextQuestion = useCallback(() => {
    setInputValue("");
    setStatus("idle");
    setHintVisible(false);
    setAnswerVisible(false);
    setErrorMessage(null);
    setSpeakingAnswer(null);
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
  }, []);

  const handleSpeakAnswer = useCallback((answer: string) => {
    if (typeof window === "undefined" || !answer) {
      return;
    }

    const { speechSynthesis } = window;
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.lang = "en-US";
    utterance.onend = () => setSpeakingAnswer(null);
    utterance.onerror = () => setSpeakingAnswer(null);

    setSpeakingAnswer(answer);
    speechSynthesis.speak(utterance);
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

    const index = resolvedQuestions.findIndex(
      (question) => question.id === requestedQuestionId,
    );
    if (index >= 0) {
      setCurrentIndex(index);
      resetStateForNextQuestion();
    }
    initializedFromQueryRef.current = true;
  }, [resolvedQuestions, resetStateForNextQuestion, searchParams]);

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

  const progressLabel =
    questionCount > 0 ? `${currentIndex + 1} / ${questionCount}` : "0 / 0";
  const accuracyRate =
    answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : null;
  const isLastQuestion = questionCount > 0 && currentIndex >= questionCount - 1;

  const moveToNextQuestion = useCallback(
    (options: { wrapAround?: boolean } = {}) => {
      if (questionCount === 0) {
        return;
      }
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= questionCount) {
          return options.wrapAround ? 0 : prev;
        }
        return nextIndex;
      });
      resetStateForNextQuestion();
    },
    [questionCount, resetStateForNextQuestion],
  );

  const findNextUnitId = useCallback(() => {
    if (!materialDetail || !data) {
      return null;
    }
    const orderedChapters = materialDetail.chapters
      .slice()
      .sort((a, b) => a.order - b.order);
    const orderedUnits = orderedChapters.flatMap((chapter) =>
      chapter.units.slice().sort((a, b) => a.order - b.order),
    );
    const currentUnitId = data.unit.id;
    const currentUnitIndex = orderedUnits.findIndex(
      (unit) => unit.id === currentUnitId,
    );
    if (
      currentUnitIndex === -1 ||
      currentUnitIndex >= orderedUnits.length - 1
    ) {
      return null;
    }
    return orderedUnits[currentUnitIndex + 1]?.id ?? null;
  }, [data, materialDetail]);

  const handleNext = useCallback(() => {
    if (questionCount === 0) {
      return;
    }
    const isLastQuestion = currentIndex >= questionCount - 1;
    if (isLastQuestion) {
      const nextUnitId = findNextUnitId();
      if (nextUnitId) {
        router.push(`/units/${nextUnitId}/study` as Route);
        return;
      }
      moveToNextQuestion({ wrapAround: true });
      return;
    }
    moveToNextQuestion();
  }, [currentIndex, findNextUnitId, moveToNextQuestion, questionCount, router]);

  const submitAnswer = useMutation({
    mutationFn: async (
      variables: SubmitUnitAnswerVariables,
    ): Promise<SubmitUnitAnswerResult> => submitUnitAnswerAction(variables),
  });

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!currentQuestion || !currentMode) {
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
          mode: currentMode,
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
          byMode: {
            ...(questionStatisticsMap[currentQuestion.id]?.byMode ?? {}),
            ...(result.modeStatistics
              ? Object.entries(result.modeStatistics).reduce<
                  Partial<Record<StudyMode, UnitStudyModeStatisticsViewModel>>
                >((acc, [mode, stats]) => {
                  acc[mode as StudyMode] = {
                    totalAttempts: stats.totalAttempts,
                    correctCount: stats.correctCount,
                    incorrectCount: stats.incorrectCount,
                    accuracy: stats.accuracy,
                    lastAttemptedAt: stats.lastAttemptedAt,
                  };
                  return acc;
                }, {})
              : {}),
          },
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
                      modeStatistics: {
                        ...(question.modeStatistics ?? {}),
                        ...(result.modeStatistics ?? {}),
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
      currentMode,
      currentQuestion,
      inputValue,
      questionStatisticsMap,
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

  const handleModeChange = useCallback(
    (questionId: string, nextMode: StudyMode) => {
      setModeByQuestion({ [questionId]: nextMode });
      setPreferredMode(nextMode);
      if (currentBaseQuestion && currentBaseQuestion.id === questionId) {
        resetStateForNextQuestion();
      }
    },
    [currentBaseQuestion, resetStateForNextQuestion],
  );

  const handleToggleHint = useCallback(() => {
    if (!currentQuestion || !currentQuestion.hint) {
      return;
    }
    setHintVisible((prev) => !prev);
  }, [currentQuestion]);

  const handleSelectQuestion = useCallback(
    (questionId: string) => {
      const index = baseQuestions.findIndex(
        (question) => question.id === questionId,
      );
      if (index === -1) {
        return;
      }
      setCurrentIndex(index);
      resetStateForNextQuestion();
    },
    [baseQuestions, resetStateForNextQuestion],
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

  const isSubmitting = submitAnswer.isPending;
  const disableSubmit = isSubmitting || isAnswered;
  const disableNext = isSubmitting || status === "idle";

  return {
    isLoading,
    isError,
    isSubmitting,
    unit: buildUnit(data ?? null),
    materialDetail: materialDetail ?? null,
    material: buildMaterialDetail(data ?? null),
    breadcrumb: buildBreadcrumb(data ?? null),
    questionCount,
    answeredCount,
    correctCount,
    accuracyRate,
    currentIndex,
    progressLabel,
    questions: resolvedQuestions,
    currentQuestion,
    currentQuestionId: currentQuestion?.id ?? null,
    availableModes: currentBaseQuestion?.availableModes ?? [
      FALLBACK_STUDY_MODE,
    ],
    selectedMode:
      currentMode ?? currentBaseQuestion?.defaultMode ?? FALLBACK_STUDY_MODE,
    currentStatistics,
    currentModeStatistics,
    inputValue,
    status,
    isHintVisible,
    isAnswerVisible,
    errorMessage,
    accountId,
    onInputChange: handleInputChange,
    onToggleHint: handleToggleHint,
    onSubmit: handleSubmit,
    onNext: handleNext,
    onReset: handleReset,
    onRetryCurrent: handleRetryCurrent,
    onSelectQuestion: handleSelectQuestion,
    onNavigateUnit: handleNavigateUnit,
    onChangeMode: (mode: StudyMode) => {
      if (!currentQuestion || !currentBaseQuestion) {
        return;
      }
      if (!currentBaseQuestion.availableModes.includes(mode)) {
        return;
      }
      handleModeChange(currentQuestion.id, mode);
    },
    answerInputId,
    speakingAnswer,
    onSpeakAnswer: handleSpeakAnswer,
    isAnswered,
    disableSubmit,
    disableNext,
    encouragement,
    statusLabel,
    remainingCount,
    isLastQuestion,
  };
}
