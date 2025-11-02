import { CheckCircle2, CircleHelp, XCircle } from "lucide-react";
import { type ComponentProps, type ComponentType, useMemo } from "react";

import type { StudyMode } from "@/external/dto/study/submit-unit-answer.dto";

import type {
  UnitStudyModeStatisticsViewModel,
  UnitStudyQuestionStatisticsViewModel,
  UnitStudyQuestionViewModel,
} from "../UnitStudyContent/useUnitStudyContent";

const JAPANESE_CHAR_PATTERN = /[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF]/u;

export interface UnitStudyQuestionCardProps {
  progressLabel: string;
  question: UnitStudyQuestionViewModel;
  answerInputId: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  disableSubmit: boolean;
  onNext: () => void;
  disableNext: boolean;
  onRetryCurrent: () => void;
  onRestartUnit: () => void;
  status: "idle" | "correct" | "incorrect";
  statusLabel: string;
  answeredCount: number;
  correctCount: number;
  isHintVisible: boolean;
  onToggleHint: () => void;
  errorMessage: string | null;
  isAnswerVisible: boolean;
  currentStatistics: UnitStudyQuestionStatisticsViewModel | null;
  currentModeStatistics: UnitStudyModeStatisticsViewModel | null;
  speakingAnswer: string | null;
  onSpeakAnswer: (answer: string) => void;
  remainingCount: number;
  isSubmitting: boolean;
  availableModes: StudyMode[];
  selectedMode: StudyMode;
  onChangeMode: (mode: StudyMode) => void;
  isLastQuestion: boolean;
}

export interface UseUnitStudyQuestionCardResult
  extends UnitStudyQuestionCardProps {
  hasAnswered: boolean;
  shouldShowRestart: boolean;
  displayedStatistics: UnitStudyQuestionStatisticsViewModel | null;
  createAnswerKey: (value: string) => string;
  createSynonymKey: (value: string) => string;
  createAntonymKey: (value: string) => string;
  createRelatedKey: (value: string) => string;
  headword: string | null;
  canSpeakHeadword: boolean;
  canSpeakEnglish: (text: string) => boolean;
  StatusIcon: ComponentType<ComponentProps<"svg">>;
}

function createValueKeyGenerator(prefix: string) {
  const occurrences = new Map<string, number>();
  return (value: string) => {
    const occurrence = occurrences.get(value) ?? 0;
    occurrences.set(value, occurrence + 1);
    return `${prefix}-${value}-${occurrence}`;
  };
}

function canSpeakEnglish(text: string): boolean {
  if (!text.trim()) {
    return false;
  }
  return !JAPANESE_CHAR_PATTERN.test(text);
}

export function useUnitStudyQuestionCard(
  props: UnitStudyQuestionCardProps,
): UseUnitStudyQuestionCardResult {
  const createAnswerKey = useMemo(
    () => createValueKeyGenerator(`answer-${props.question.id}`),
    [props.question.id],
  );
  const createSynonymKey = useMemo(
    () => createValueKeyGenerator(`synonym-${props.question.id}`),
    [props.question.id],
  );
  const createAntonymKey = useMemo(
    () => createValueKeyGenerator(`antonym-${props.question.id}`),
    [props.question.id],
  );
  const createRelatedKey = useMemo(
    () => createValueKeyGenerator(`related-${props.question.id}`),
    [props.question.id],
  );

  const headword =
    props.question.vocabulary?.headword ?? props.question.headword ?? null;
  const canSpeakHeadword = headword ? canSpeakEnglish(headword) : false;
  const hasAnswered = props.status !== "idle";
  const shouldShowRestart = hasAnswered && props.isLastQuestion;
  const displayedStatistics = useMemo(() => {
    if (props.currentModeStatistics) {
      const byMode = props.currentStatistics?.byMode ?? {};
      return {
        ...props.currentModeStatistics,
        byMode,
      } satisfies UnitStudyQuestionStatisticsViewModel;
    }
    return props.currentStatistics ?? null;
  }, [props.currentModeStatistics, props.currentStatistics]);

  const StatusIcon = useMemo(() => getStatusIcon(props.status), [props.status]);

  return {
    ...props,
    hasAnswered,
    shouldShowRestart,
    displayedStatistics,
    createAnswerKey,
    createSynonymKey,
    createAntonymKey,
    createRelatedKey,
    headword,
    canSpeakHeadword,
    canSpeakEnglish,
    StatusIcon,
  } satisfies UseUnitStudyQuestionCardResult;
}

function getStatusIcon(status: "idle" | "correct" | "incorrect") {
  if (status === "correct") return CheckCircle2;
  if (status === "incorrect") return XCircle;
  return CircleHelp;
}
