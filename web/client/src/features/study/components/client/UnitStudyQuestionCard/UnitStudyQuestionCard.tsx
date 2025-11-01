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
  UnitStudyModeStatisticsViewModel,
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

const MODE_LABEL: Record<StudyMode, string> = {
  jp_to_en: "日→英",
  en_to_jp: "英→日",
  sentence: "英作文",
  conversation_roleplay: "ロールプレイ",
  listening_comprehension: "リスニング",
  writing_review: "ライティング",
};

function getStatusIcon(status: "idle" | "correct" | "incorrect") {
  if (status === "correct") return CheckCircle2;
  if (status === "incorrect") return XCircle;
  return CircleHelp;
}

const JAPANESE_CHAR_PATTERN = /[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF]/u;

function _canSpeakEnglish(text: string): boolean {
  if (!text.trim()) {
    return false;
  }
  return !JAPANESE_CHAR_PATTERN.test(text);
}

function _createValueKeyGenerator(prefix: string) {
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
  onRestartUnit,
  status,
  statusLabel,
  answeredCount,
  correctCount,
  isHintVisible,
  onToggleHint,
  errorMessage,
  isAnswerVisible,
  currentStatistics,
  currentModeStatistics,
  speakingAnswer,
  onSpeakAnswer,
  remainingCount,
  isSubmitting,
  availableModes,
  selectedMode,
  onChangeMode,
  isLastQuestion,
}: UnitStudyQuestionCardProps) {
  const StatusIcon = getStatusIcon(status);
  const hasAnswered = status !== "idle";
  const shouldShowRestart = hasAnswered && isLastQuestion;
  const displayedStatistics = currentModeStatistics ?? currentStatistics;
  const createAnswerKey = _createValueKeyGenerator(`answer-${question.id}`);
  const createSynonymKey = _createValueKeyGenerator(`synonym-${question.id}`);
  const createAntonymKey = _createValueKeyGenerator(`antonym-${question.id}`);
  const createRelatedKey = _createValueKeyGenerator(`related-${question.id}`);
  const headword = question.vocabulary?.headword ?? question.headword ?? null;
  const canSpeakHeadword = headword ? _canSpeakEnglish(headword) : false;

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
                onClick={() => onChangeMode(mode)}
                disabled={isSubmitting || mode === selectedMode}
              >
                {MODE_LABEL[mode]}
              </Button>
            ))}
          </div>
        ) : null}
        <CardTitle className="text-2xl font-bold text-slate-900">
          {question.title}{" "}
          {selectedMode === "sentence"
            ? (question.sentencePromptJa ?? question.promptText)
            : question.promptText}
        </CardTitle>
        {selectedMode !== "sentence" && question.vocabulary ? (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {question.vocabulary.partOfSpeech ? (
              <span className="rounded-full border border-indigo-200 bg-indigo-100 px-3 py-1 text-base font-semibold uppercase tracking-wide text-indigo-700 shadow-sm">
                {question.vocabulary.partOfSpeech}
              </span>
            ) : null}
            {question.vocabulary.pronunciation ? (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 shadow-sm">
                {question.vocabulary.pronunciation}
              </span>
            ) : null}
          </div>
        ) : null}
        {selectedMode === "sentence" && question.sentencePromptJa ? (
          <div className="space-y-2 text-sm text-indigo-900">
            <p className="text-indigo-700">
              上記の日本語の文章を英語で書いてください
            </p>
            {question.sentenceTargetWord ? (
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-indigo-700">
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-base shadow-sm">
                  この単語を必ず使う:{" "}
                  <span className="text-lg font-bold text-indigo-800">
                    {question.sentenceTargetWord}
                  </span>
                </span>
                {question.vocabulary?.partOfSpeech ? (
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-600 shadow-sm">
                    {question.vocabulary.partOfSpeech}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
        {question.promptNote && selectedMode !== "sentence" ? (
          <p className="whitespace-pre-line text-sm text-slate-600">
            {question.promptNote}
          </p>
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
              {shouldShowRestart ? (
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
              <ul className="list-disc space-y-1 pl-5 text-sm text-indigo-900">
                {question.acceptableAnswers.map((answer) => {
                  const key = createAnswerKey(answer);
                  const canSpeak = _canSpeakEnglish(answer);
                  return (
                    <li key={key} className="flex items-center gap-2">
                      <span>{answer}</span>
                      {canSpeak ? (
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
                  );
                })}
              </ul>
            </div>

            {question.explanation ? (
              <p className="text-xs text-indigo-800/90">
                解説: {question.explanation}
              </p>
            ) : null}

            {question.vocabulary ? (
              <div className="space-y-2 rounded-xl border border-indigo-100 bg-white/80 px-3 py-3 text-sm text-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  {headword ? (
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-indigo-700">
                        {headword}
                      </span>
                      {selectedMode === "en_to_jp" && canSpeakHeadword ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 rounded-full px-2 text-indigo-600 hover:text-indigo-500"
                          onClick={() => headword && onSpeakAnswer(headword)}
                          disabled={speakingAnswer === headword}
                        >
                          <Volume2 className="size-4" />
                          {speakingAnswer === headword ? "再生中..." : "音声"}
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                  {question.vocabulary.partOfSpeech ? (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] text-indigo-700">
                      {question.vocabulary.partOfSpeech}
                    </span>
                  ) : null}
                  {question.vocabulary.pronunciation ? (
                    <span className="text-xs text-muted-foreground">
                      {question.vocabulary.pronunciation}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-slate-700">
                  日本語訳: {question.vocabulary.definitionJa}
                </p>
                {question.vocabulary.memo ? (
                  <p className="text-xs text-muted-foreground">
                    メモ: {question.vocabulary.memo}
                  </p>
                ) : null}
                {question.vocabulary.synonyms.length > 0 ? (
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-indigo-600">
                      類義語
                    </span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {question.vocabulary.synonyms.map((item) => {
                        const key = createSynonymKey(item);
                        const canSpeak = _canSpeakEnglish(item);
                        return canSpeak ? (
                          <button
                            key={key}
                            type="button"
                            onClick={() => onSpeakAnswer(item)}
                            disabled={speakingAnswer === item}
                            className="flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] text-indigo-700 transition hover:bg-indigo-200 disabled:opacity-60"
                            aria-label={`${item} を再生`}
                          >
                            <span>{item}</span>
                            <Volume2 className="size-3" />
                          </button>
                        ) : (
                          <span
                            key={key}
                            className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] text-indigo-700"
                          >
                            {item}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                {question.vocabulary.antonyms.length > 0 ? (
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-indigo-600">
                      対義語
                    </span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {question.vocabulary.antonyms.map((item) => {
                        const key = createAntonymKey(item);
                        const canSpeak = _canSpeakEnglish(item);
                        return canSpeak ? (
                          <button
                            key={key}
                            type="button"
                            onClick={() => onSpeakAnswer(item)}
                            disabled={speakingAnswer === item}
                            className="flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] text-indigo-700 transition hover:bg-indigo-200 disabled:opacity-60"
                            aria-label={`${item} を再生`}
                          >
                            <span>{item}</span>
                            <Volume2 className="size-3" />
                          </button>
                        ) : (
                          <span
                            key={key}
                            className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] text-indigo-700"
                          >
                            {item}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                {question.vocabulary.relatedWords.length > 0 ? (
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-indigo-600">
                      関連語
                    </span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {question.vocabulary.relatedWords.map((item) => {
                        const key = createRelatedKey(item);
                        const canSpeak = _canSpeakEnglish(item);
                        return canSpeak ? (
                          <button
                            key={key}
                            type="button"
                            onClick={() => onSpeakAnswer(item)}
                            disabled={speakingAnswer === item}
                            className="flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] text-indigo-700 transition hover:bg-indigo-200 disabled:opacity-60"
                            aria-label={`${item} を再生`}
                          >
                            <span>{item}</span>
                            <Volume2 className="size-3" />
                          </button>
                        ) : (
                          <span
                            key={key}
                            className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] text-indigo-700"
                          >
                            {item}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                {question.vocabulary.exampleSentenceEn ||
                question.vocabulary.exampleSentenceJa ? (
                  <div className="space-y-1 rounded-lg bg-slate-50/80 px-3 py-2 text-xs text-slate-700">
                    {question.vocabulary.exampleSentenceEn ? (
                      <p>
                        <span className="font-semibold text-indigo-600">
                          英:
                        </span>{" "}
                        {question.vocabulary.exampleSentenceEn}
                      </p>
                    ) : null}
                    {question.vocabulary.exampleSentenceJa ? (
                      <p>
                        <span className="font-semibold text-indigo-600">
                          和:
                        </span>{" "}
                        {question.vocabulary.exampleSentenceJa}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {currentStatistics ? (
              <div className="space-y-3">
                <div className="grid gap-2 rounded-lg border border-indigo-100 bg-white/70 p-3 text-xs text-slate-700">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                    {currentModeStatistics
                      ? `${MODE_LABEL[selectedMode]}モードの記録`
                      : "この問題の通算記録"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span>解答回数</span>
                    <span className="font-semibold text-slate-900">
                      {displayedStatistics?.totalAttempts ?? 0} 回
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>正解数</span>
                    <span className="font-semibold text-slate-900">
                      {displayedStatistics?.correctCount ?? 0} 回
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>正答率</span>
                    <span className="font-semibold text-slate-900">
                      {displayedStatistics
                        ? Math.round(displayedStatistics.accuracy * 100)
                        : "--"}
                      {displayedStatistics ? "%" : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>最終解答日</span>
                    <span>
                      {displayedStatistics?.lastAttemptedAt
                        ? new Date(
                            displayedStatistics.lastAttemptedAt,
                          ).toLocaleString()
                        : "まだこれから！"}
                    </span>
                  </div>
                </div>
                {Object.entries(currentStatistics.byMode).length > 0 ? (
                  <div className="rounded-lg border border-indigo-100 bg-white/60 p-3">
                    <p className="text-[11px] font-semibold text-indigo-600">
                      モード別の成績
                    </p>
                    <div className="mt-2 space-y-1 text-[11px] text-slate-700">
                      {Object.entries(currentStatistics.byMode).map(
                        ([mode, stat]) => {
                          if (!stat) {
                            return null;
                          }
                          const isActive = mode === selectedMode;
                          return (
                            <div
                              key={mode}
                              className={cn(
                                "flex items-center justify-between rounded-md px-3 py-1",
                                isActive
                                  ? "bg-indigo-100/80 font-semibold text-indigo-800"
                                  : "bg-slate-50/80",
                              )}
                            >
                              <span>{MODE_LABEL[mode as StudyMode]}</span>
                              <span>
                                {Math.round(stat.accuracy * 100)}% (
                                {stat.correctCount}/{stat.totalAttempts})
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                ) : null}
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

function _normalizeForComparison(value: string): string {
  return value.trim().toLowerCase();
}
