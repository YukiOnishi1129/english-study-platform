"use client";

import {
  CheckCircle2,
  CircleHelp,
  RotateCcw,
  Volume2,
  XCircle,
} from "lucide-react";
import type { StudyMode } from "@/external/dto/study/submit-unit-answer.dto";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";

import type {
  UnitStudyQuestionStatisticsViewModel,
  UnitStudyQuestionViewModel,
} from "../UnitStudyContent/useUnitStudyContent";

interface UnitStudyQuestionCardProps {
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
  status: "idle" | "correct" | "incorrect";
  statusLabel: string;
  answeredCount: number;
  correctCount: number;
  isHintVisible: boolean;
  onToggleHint: () => void;
  errorMessage: string | null;
  isAnswerVisible: boolean;
  currentStatistics: UnitStudyQuestionStatisticsViewModel | null;
  speakingAnswer: string | null;
  onSpeakAnswer: (answer: string) => void;
  remainingCount: number;
  isSubmitting: boolean;
  availableModes: StudyMode[];
  selectedMode: StudyMode;
  onChangeMode: (mode: StudyMode) => void;
  isLastQuestion: boolean;
  onRestartUnit: () => void;
}

function getStatusIcon(status: "idle" | "correct" | "incorrect") {
  if (status === "correct") return CheckCircle2;
  if (status === "incorrect") return XCircle;
  return CircleHelp;
}

const MODE_LABELS: Record<StudyMode, string> = {
  jp_to_en: "英→日",
  en_to_jp: "日→英",
  sentence: "英作文",
  default: "標準",
};

const JAPANESE_CHAR_PATTERN = /[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF]/u;

function canSpeakEnglish(text: string): boolean {
  if (!text.trim()) {
    return false;
  }
  return !JAPANESE_CHAR_PATTERN.test(text);
}

function createValueKeyGenerator(prefix: string) {
  const occurrences = new Map<string, number>();
  return (value: string) => {
    const occurrence = occurrences.get(value) ?? 0;
    occurrences.set(value, occurrence + 1);
    return `${prefix}-${value}-${occurrence}`;
  };
}

export function UnitStudyQuestionCard({
  progressLabel,
  question,
  answerInputId,
  inputValue,
  onInputChange,
  onSubmit,
  disableSubmit,
  onNext,
  disableNext,
  onRetryCurrent,
  status,
  statusLabel,
  answeredCount,
  correctCount,
  isHintVisible,
  onToggleHint,
  errorMessage,
  isAnswerVisible,
  currentStatistics,
  speakingAnswer,
  onSpeakAnswer,
  remainingCount,
  isSubmitting,
  availableModes,
  selectedMode,
  onChangeMode,
  isLastQuestion,
  onRestartUnit,
}: UnitStudyQuestionCardProps) {
  const StatusIcon = getStatusIcon(status);
  const isSentenceMode = selectedMode === "sentence";
  const hasAnswered = status !== "idle";
  const vocabulary = question.vocabulary ?? null;
  const headwordText =
    vocabulary?.headword ??
    (question.headword && question.headword.trim().length > 0
      ? question.headword
      : null);
  const shouldShowSeparateHeadword =
    headwordText !== null &&
    canSpeakEnglish(headwordText) &&
    (selectedMode === "en_to_jp" ||
      !question.acceptableAnswers.some(
        (answer) =>
          normalizeForComparison(answer) ===
          normalizeForComparison(headwordText),
      ));
  const isHeadwordSpeaking = headwordText === speakingAnswer;
  const sentenceTargetWord = question.sentenceTargetWord ?? null;
  const isSentenceTargetSpeaking = sentenceTargetWord === speakingAnswer;

  const renderVocabularyList = (label: string, items: string[] | undefined) => {
    if (!items || items.length === 0) {
      return null;
    }
    const buildKey = createValueKeyGenerator(label);
    return (
      <div className="space-y-1 text-xs text-slate-600">
        <span className="font-semibold text-indigo-600">{label}</span>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => {
            const key = buildKey(item);
            const speakable = canSpeakEnglish(item);
            const isSpeaking = speakingAnswer === item;
            return (
              <div
                key={key}
                className="flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] text-indigo-700"
              >
                <span>{item}</span>
                {speakable ? (
                  <button
                    type="button"
                    onClick={() => onSpeakAnswer(item)}
                    disabled={isSubmitting || isSpeaking}
                    className="rounded-full p-0.5 text-indigo-600 transition hover:text-indigo-500 disabled:opacity-60"
                  >
                    <Volume2 className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">{`${item} を音声で聞く`}</span>
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const shouldShowDefinition =
    question.definitionJa &&
    question.definitionJa.trim().length > 0 &&
    question.definitionJa.trim() !== question.promptText.trim();

  const buildAnswerKey = createValueKeyGenerator(`${question.id}-answer`);

  return (
    <Card className="border border-indigo-200/70 bg-white/95 shadow-md">
      <CardHeader className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600">
            {progressLabel}
          </span>
          <Button
            type="button"
            variant="ghost"
            className="gap-1 text-xs text-muted-foreground"
            onClick={onRetryCurrent}
            disabled={isSubmitting}
          >
            <RotateCcw className="size-3.5" />
            最初からやり直す
          </Button>
        </div>
        {availableModes.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {availableModes.map((mode) => (
              <Button
                key={mode}
                type="button"
                variant={mode === selectedMode ? "default" : "outline"}
                size="sm"
                onClick={() => mode !== selectedMode && onChangeMode(mode)}
                disabled={isSubmitting}
              >
                {MODE_LABELS[mode]}
              </Button>
            ))}
          </div>
        ) : null}
        <CardTitle className="text-2xl font-bold text-slate-900">
          {question.title} {question.promptText}
        </CardTitle>
        {question.promptNote ? (
          <p className="whitespace-pre-line text-sm text-slate-500">
            {question.promptNote}
          </p>
        ) : null}
        {isSentenceMode && question.sentencePromptJa ? (
          <div className="space-y-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-3 text-sm text-indigo-900">
            <div className="space-y-1">
              <span className="font-semibold text-indigo-700">
                以下の文章を英語で書いてください
              </span>
              <p className="whitespace-pre-line">{question.sentencePromptJa}</p>
            </div>
            {sentenceTargetWord ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                  この単語を使ってください
                </span>
                <span className="text-base font-semibold text-indigo-800">
                  {sentenceTargetWord}
                </span>
                {canSpeakEnglish(sentenceTargetWord) ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 rounded-full px-2 text-indigo-600 hover:text-indigo-500"
                    onClick={() => onSpeakAnswer(sentenceTargetWord)}
                    disabled={isSentenceTargetSpeaking}
                  >
                    <Volume2 className="size-4" />
                    {isSentenceTargetSpeaking ? "再生中..." : "音声"}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
        <CardDescription className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
          <span>
            「答える → 答えをチェック →
            次の問題へ」のリズムで繰り返し覚えましょう。
          </span>
          <span className="text-xs text-muted-foreground">
            残り {remainingCount >= 0 ? remainingCount : 0} 問
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant={isHintVisible ? "default" : "outline"}
            size="sm"
            onClick={onToggleHint}
            disabled={!question.hint}
          >
            ヒントを{isHintVisible ? "隠す" : "見る"}
          </Button>
          {!question.hint ? (
            <span className="text-xs text-muted-foreground">
              ヒントはまだ登録されていません。
            </span>
          ) : null}
        </div>

        {isHintVisible && question.hint ? (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
            ヒント: <span className="whitespace-pre-line">{question.hint}</span>
          </div>
        ) : null}

        <form
          className="space-y-3 rounded-2xl bg-slate-50/60 p-4"
          onSubmit={onSubmit}
        >
          <label
            className="block text-xs font-semibold uppercase tracking-widest text-slate-500"
            htmlFor={answerInputId}
          >
            {question.answerLabel}
          </label>
          <Input
            id={answerInputId}
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={question.answerPlaceholder}
            autoFocus
            disabled={disableSubmit}
            className="h-12 rounded-xl border-indigo-100 bg-white px-4 text-base"
          />
          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              className="flex-1 min-w-[140px] rounded-xl bg-indigo-500 text-base font-semibold text-white hover:bg-indigo-500/90"
              disabled={disableSubmit}
            >
              {isSubmitting ? "判定中..." : "回答する"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1 min-w-[140px] rounded-xl bg-amber-100 text-amber-800 hover:bg-amber-200"
              onClick={onNext}
              disabled={disableNext}
            >
              次の問題へ進む
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 min-w-[140px] rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              onClick={onRetryCurrent}
              disabled={status === "idle"}
            >
              この問題をやり直す
            </Button>
          </div>
          {status === "idle" ? (
            <p className="text-xs text-muted-foreground">
              回答すると正解例と解説が表示されます。
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-indigo-600">
                「次の問題へ進む」を押すと、次のクイズに挑戦できます。
              </p>
              {isLastQuestion && hasAnswered ? (
                <div className="space-y-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-800">
                  <p className="font-semibold text-sm">
                    このUNITの学習が一巡しました。もう一度最初から挑戦してみましょうか？
                  </p>
                  <Button
                    type="button"
                    className="w-full rounded-lg bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-500/90"
                    onClick={onRestartUnit}
                  >
                    UNITを最初から解き直す
                  </Button>
                </div>
              ) : null}
            </div>
          )}
          {errorMessage ? (
            <p className="text-xs font-medium text-red-600">{errorMessage}</p>
          ) : null}
        </form>

        <Separator />

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm shadow-inner transition-all">
          <StatusIcon
            className={cn(
              "size-5",
              status === "correct" && "text-green-600",
              status === "incorrect" && "text-red-600",
              status === "idle" && "text-indigo-600",
            )}
          />
          <span
            className={cn(
              "font-semibold",
              status === "correct" && "text-green-600",
              status === "incorrect" && "text-red-600",
            )}
          >
            {statusLabel}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            解答 {answeredCount} / 正解 {correctCount}
          </span>
        </div>

        {isAnswerVisible ? (
          <div className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                正解例
              </p>
              {shouldShowSeparateHeadword && headwordText ? (
                <div className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm text-indigo-900">
                  <span className="font-semibold text-indigo-700">
                    {headwordText}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 rounded-full px-2 text-indigo-600 hover:text-indigo-500"
                    onClick={() => onSpeakAnswer(headwordText)}
                    disabled={isHeadwordSpeaking}
                  >
                    <Volume2 className="size-4" />
                    {isHeadwordSpeaking ? "再生中..." : "音声"}
                  </Button>
                </div>
              ) : null}
              <ul className="list-disc space-y-1 pl-5 text-sm text-indigo-900">
                {question.acceptableAnswers.map((answer) => (
                  <li
                    key={buildAnswerKey(answer)}
                    className="flex items-center gap-2"
                  >
                    <span>{answer}</span>
                    {canSpeakEnglish(answer) ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 rounded-full px-2 text-indigo-600 hover:text-indigo-500"
                        onClick={() => onSpeakAnswer(answer)}
                        disabled={speakingAnswer === answer}
                      >
                        <Volume2 className="size-4" />
                        {speakingAnswer === answer ? "再生中..." : "音声"}
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            {shouldShowDefinition ? (
              <div className="rounded-xl border border-indigo-100 bg-white/80 px-3 py-2 text-sm text-slate-700">
                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  日本語の意味
                </span>
                <p className="mt-1">{question.definitionJa}</p>
              </div>
            ) : null}

            {vocabulary ? (
              <div className="space-y-2 rounded-xl border border-indigo-100 bg-white/80 px-3 py-3 text-sm text-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold text-indigo-700">
                    {vocabulary.headword}
                  </span>
                  {vocabulary.headword &&
                  canSpeakEnglish(vocabulary.headword) ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 rounded-full px-2 text-indigo-600 hover:text-indigo-500"
                      onClick={() => {
                        if (vocabulary.headword) {
                          onSpeakAnswer(vocabulary.headword);
                        }
                      }}
                      disabled={speakingAnswer === vocabulary.headword}
                    >
                      <Volume2 className="size-4" />
                      {speakingAnswer === vocabulary.headword
                        ? "再生中..."
                        : "音声"}
                    </Button>
                  ) : null}
                  {vocabulary.partOfSpeech ? (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] text-indigo-700">
                      {vocabulary.partOfSpeech}
                    </span>
                  ) : null}
                  {vocabulary.pronunciation ? (
                    <span className="text-xs text-muted-foreground">
                      {vocabulary.pronunciation}
                    </span>
                  ) : null}
                </div>
                {vocabulary.definitionJa ? (
                  <p className="text-sm text-slate-700">
                    日本語訳: {vocabulary.definitionJa}
                  </p>
                ) : null}
                {vocabulary.memo ? (
                  <p className="text-xs text-muted-foreground">
                    メモ: {vocabulary.memo}
                  </p>
                ) : null}
                {renderVocabularyList("類義語", vocabulary.synonyms)}
                {renderVocabularyList("対義語", vocabulary.antonyms)}
                {renderVocabularyList("関連語", vocabulary.relatedWords)}
                {vocabulary.exampleSentenceEn ||
                vocabulary.exampleSentenceJa ? (
                  <div className="space-y-1 rounded-lg bg-slate-50/80 px-3 py-2 text-xs text-slate-700">
                    {vocabulary.exampleSentenceEn ? (
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 font-semibold text-indigo-600">
                          英:
                        </span>
                        <span className="flex-1">
                          {vocabulary.exampleSentenceEn}
                        </span>
                        {canSpeakEnglish(vocabulary.exampleSentenceEn) ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 rounded-full px-2 text-indigo-600 hover:text-indigo-500"
                            onClick={() => {
                              if (vocabulary.exampleSentenceEn) {
                                onSpeakAnswer(vocabulary.exampleSentenceEn);
                              }
                            }}
                            disabled={
                              speakingAnswer === vocabulary.exampleSentenceEn
                            }
                          >
                            <Volume2 className="size-4" />
                            {speakingAnswer === vocabulary.exampleSentenceEn
                              ? "再生中..."
                              : "音声"}
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                    {vocabulary.exampleSentenceJa ? (
                      <p>
                        <span className="font-semibold text-indigo-600">
                          和:
                        </span>{" "}
                        {vocabulary.exampleSentenceJa}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {question.explanation ? (
              <p className="text-xs text-indigo-800/90">
                解説: {question.explanation}
              </p>
            ) : null}

            {currentStatistics ? (
              <div className="grid gap-2 rounded-lg border border-indigo-100 bg-white/70 p-3 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span>解答回数</span>
                  <span className="font-semibold text-slate-900">
                    {currentStatistics.totalAttempts} 回
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>正解数</span>
                  <span className="font-semibold text-slate-900">
                    {currentStatistics.correctCount} 回
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>正答率</span>
                  <span className="font-semibold text-slate-900">
                    {Math.round(currentStatistics.accuracy * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>最終解答日</span>
                  <span>
                    {currentStatistics.lastAttemptedAt
                      ? new Date(
                          currentStatistics.lastAttemptedAt,
                        ).toLocaleString()
                      : "まだこれから！"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-indigo-700/80">
                まだこの問題の学習履歴はありません。
              </p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function normalizeForComparison(value: string): string {
  return value.trim().toLowerCase();
}
