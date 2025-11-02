"use client";

import { RotateCcw, Volume2 } from "lucide-react";
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

import type { UseUnitStudyQuestionCardResult } from "./useUnitStudyQuestionCard";

const MODE_LABEL: Record<StudyMode, string> = {
  jp_to_en: "日→英",
  en_to_jp: "英→日",
  sentence: "英作文",
  conversation_roleplay: "ロールプレイ",
  listening_comprehension: "リスニング",
  writing_review: "ライティング",
};

export type UnitStudyQuestionCardPresenterProps =
  UseUnitStudyQuestionCardResult;

export function UnitStudyQuestionCardPresenter(
  props: UnitStudyQuestionCardPresenterProps,
) {
  const {
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
    currentModeStatistics,
    speakingAnswer,
    onSpeakAnswer,
    remainingCount,
    isSubmitting,
    availableModes,
    selectedMode,
    onChangeMode,
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
  } = props;

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
              </div>
            ) : null}
          </div>
        ) : null}
        {selectedMode !== "sentence" && headword ? (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="font-semibold text-indigo-700">見出し語:</span>
            <span className="text-lg font-bold text-slate-900">{headword}</span>
            {canSpeakHeadword ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1 text-indigo-600"
                onClick={() => onSpeakAnswer(headword)}
                disabled={speakingAnswer === headword}
              >
                <Volume2 className="size-4" />
                {speakingAnswer === headword ? "再生中..." : "音声"}
              </Button>
            ) : null}
          </div>
        ) : null}
        {question.promptNote && selectedMode !== "sentence" ? (
          <p className="whitespace-pre-line text-sm text-slate-600">
            {question.promptNote}
          </p>
        ) : null}
        {question.annotation ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <span className="font-semibold">注釈:</span>{" "}
            <span className="whitespace-pre-line">{question.annotation}</span>
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
            placeholder={question.answerPlaceholder ?? "例: 回答を入力"}
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
        </form>

        {isAnswerVisible ? (
          <div className="space-y-4 rounded-2xl border border-indigo-100 bg-white/90 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <StatusIcon
                className={cn(
                  "size-4",
                  status === "correct" ? "text-emerald-500" : "text-rose-500",
                )}
              />
              <span>{statusLabel}</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                  正解例
                </p>
                <ul className="mt-2 space-y-2">
                  {question.acceptableAnswers.map((answer) => (
                    <li
                      key={createAnswerKey(answer)}
                      className="flex flex-wrap items-center gap-3 text-sm text-slate-800"
                    >
                      <span>{answer}</span>
                      {canSpeakEnglish(answer) ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-indigo-600"
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
              {question.vocabulary ? (
                <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-700">
                  <p className="font-semibold text-slate-900">語彙情報</p>
                  <div className="flex flex-wrap gap-2">
                    {question.vocabulary.synonyms.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-600">
                          類義語
                        </span>
                        {question.vocabulary.synonyms.map((item) => (
                          <span
                            key={createSynonymKey(item)}
                            className="rounded-full bg-white px-2 py-0.5 text-[11px] text-indigo-700"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {question.vocabulary.antonyms.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] text-rose-600">
                          対義語
                        </span>
                        {question.vocabulary.antonyms.map((item) => (
                          <span
                            key={createAntonymKey(item)}
                            className="rounded-full bg-white px-2 py-0.5 text-[11px] text-rose-600"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {question.vocabulary.relatedWords.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-600">
                          関連語
                        </span>
                        {question.vocabulary.relatedWords.map((item) => (
                          <span
                            key={createRelatedKey(item)}
                            className="rounded-full bg-white px-2 py-0.5 text-[11px] text-amber-600"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {question.vocabulary.exampleSentenceEn ||
                    question.vocabulary.exampleSentenceJa ? (
                      <div className="space-y-1 rounded-lg bg-slate-50/80 px-3 py-2 text-xs text-slate-700">
                        {question.vocabulary.exampleSentenceEn ? (
                          <p className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-indigo-600">
                              英:
                            </span>
                            <span>{question.vocabulary.exampleSentenceEn}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-auto rounded-full border-indigo-200 px-2 py-0.5 text-[11px] text-indigo-600 hover:bg-indigo-50"
                              onClick={() =>
                                onSpeakAnswer(
                                  question.vocabulary?.exampleSentenceEn ?? "",
                                )
                              }
                              disabled={
                                speakingAnswer ===
                                  question.vocabulary?.exampleSentenceEn ||
                                !question.vocabulary?.exampleSentenceEn
                              }
                            >
                              <Volume2 className="mr-1 size-3" />
                              {speakingAnswer ===
                              question.vocabulary?.exampleSentenceEn
                                ? "再生中"
                                : "音声"}
                            </Button>
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
                </div>
              ) : null}
              {question.explanation ? (
                <div className="rounded-lg bg-slate-50/70 px-3 py-2 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">解説: </span>
                  <span className="whitespace-pre-line">
                    {question.explanation}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {errorMessage ? (
          <p className="text-sm text-rose-600">{errorMessage}</p>
        ) : null}

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <p>
            正答数 {correctCount} / 解答数 {answeredCount} ・ 残り{" "}
            {remainingCount}問
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="rounded-full"
              onClick={onRetryCurrent}
              disabled={isSubmitting}
            >
              やり直す
            </Button>
            <Button
              type="button"
              className="rounded-full bg-indigo-600 text-white hover:bg-indigo-500"
              onClick={onNext}
              disabled={disableNext}
            >
              次の問題へ
            </Button>
          </div>
        </div>

        {displayedStatistics ? (
          <div className="space-y-3 rounded-lg border border-indigo-100 bg-white/70 p-3 text-xs text-slate-700">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
              {currentModeStatistics
                ? `${MODE_LABEL[selectedMode]}モードの記録`
                : "この問題の通算記録"}
            </p>
            <div className="flex items-center justify-between">
              <span>解答回数</span>
              <span className="font-semibold text-slate-900">
                {displayedStatistics.totalAttempts ?? 0} 回
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>正解数</span>
              <span className="font-semibold text-slate-900">
                {displayedStatistics.correctCount ?? 0} 回
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>不正解数</span>
              <span className="font-semibold text-slate-900">
                {displayedStatistics.incorrectCount ?? 0} 回
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>正答率</span>
              <span className="font-semibold text-slate-900">
                {displayedStatistics.totalAttempts
                  ? `${Math.round(
                      (displayedStatistics.correctCount /
                        displayedStatistics.totalAttempts) *
                        100,
                    )}%`
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>最終解答日</span>
              <span className="font-semibold text-slate-900">
                {displayedStatistics.lastAttemptedAt
                  ? new Date(
                      displayedStatistics.lastAttemptedAt,
                    ).toLocaleString("ja-JP")
                  : "-"}
              </span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
