import { FeatureHighlightCard } from "@/features/landing/components/client/FeatureHighlightCard";
import { FlowStepItem } from "@/features/landing/components/client/FlowStepItem";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

const FEATURE_CARDS = [
  {
    icon: "⚡️",
    title: "テンポよく解いてスッと覚える",
    description:
      "1問数秒のリズムでどんどん出題。テンポ良く解く→確認するを繰り返すうちに、表現がからだに染み込みます。",
  },
  {
    icon: "🔄",
    title: "モード切替で弱点を追い込み",
    description:
      "日→英・英→日・英作文モードをワンタップでチェンジ。苦手なアウトプットだけに集中できます。",
  },
  {
    icon: "🎯",
    title: "伸びを実感できる振り返り",
    description:
      "解答履歴や正解候補をまとめて確認。今日できたことが可視化され、次の学習が待ち遠しくなります。",
  },
] as const;

const FLOW_STEPS = [
  {
    step: "STEP 1",
    title: "まずは 5 問でエンジン点火",
    description:
      "ウォームアップの数問で解答ペースを整え、学習モードへスムーズに移行します。",
  },
  {
    step: "STEP 2",
    title: "モードを切り替えて総合演習",
    description:
      "日→英で瞬発力、英→日で理解、英作文で表現力。モードを変えながらアウトプットを磨きます。",
  },
  {
    step: "STEP 3",
    title: "振り返りで記憶を定着",
    description:
      "間違えた単語や例文をサッとチェック。迷いポイントをメモし、翌日の復習につなげます。",
  },
] as const;

const VOCABULARY_MODES = [
  "英単語 → 日本語訳",
  "日本語 → 英単語",
  "日本語 → 英作文（英語で回答）",
] as const;

export function LandingPageTemplate() {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <a
          className="text-lg font-semibold tracking-wide text-indigo-100"
          href="/"
        >
          English Study Platform
        </a>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white"
        >
          <a href="/login">ログイン</a>
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-28 sm:pb-32">
        <section className="grid gap-12 text-center sm:text-left lg:grid-cols-[minmax(0,1fr),minmax(0,420px)] lg:items-center">
          <div className="space-y-8">
            <Badge className="bg-white/15 text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">
              KEEP SOLVING
            </Badge>
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-[3.4rem]">
              <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
                楽しくスピーディーに解きまくれる
              </span>
              <br />
              英語アウトプット専用プラットフォーム
            </h1>
            <p className="text-lg leading-relaxed text-indigo-100/85 sm:text-xl">
              ボタン一つでモード切替。テンポの良い出題と即フィードバックで、
              「分かる」ではなく「使える」英語を短時間で積み上げていきます。間違えた問題は自動で復習タブにまとまり、まとめて解き直せます。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
              <Button
                asChild
                size="lg"
                className="px-7 bg-amber-400 text-slate-900 hover:bg-amber-300 hover:text-slate-900"
              >
                <a href="/login">いますぐ問題を解いてみる</a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <a href="#features">特徴をチェック</a>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
              {VOCABULARY_MODES.map((mode) => (
                <Badge
                  key={mode}
                  variant="outline"
                  className="border-white/25 bg-white/5 text-white"
                >
                  {mode}
                </Badge>
              ))}
            </div>
          </div>

          <Card className="border-white/15 bg-white/[0.07] text-left backdrop-blur">
            <CardHeader className="space-y-4">
              <Badge
                variant="secondary"
                className="w-fit bg-amber-100 text-amber-700"
              >
                英作文モード
              </Badge>
              <CardTitle className="text-2xl font-semibold text-white">
                Q7: これは正しくない。
              </CardTitle>
              <CardDescription className="text-indigo-100/80">
                英単語「correct」を使って即答で英作文。入力して答え合わせをすることで、表現の揺らぎも確認できます。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-indigo-100/85">
              <div className="rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.35em] text-indigo-200">
                  SAMPLE ANSWER
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  It isn&apos;t correct.
                </p>
              </div>
              <p>
                他の正答候補や例文、日本語訳も一覧で表示。苦手フレーズのメモも同じ画面に残せるから、
                復習の段取りがとてもシンプルです。
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 text-xs text-indigo-200/80 sm:flex-row sm:items-center sm:justify-between">
              <span>解いた履歴も自動で残るから復習がかんたん</span>
              <span>1 問 ≒ 数秒でテンポ良く解ける</span>
            </CardFooter>
          </Card>
        </section>

        <section
          id="features"
          className="space-y-10 rounded-3xl bg-white/95 p-10 text-left text-slate-900 shadow-2xl shadow-indigo-900/30"
        >
          <header className="space-y-4 text-center sm:text-left">
            <Badge
              variant="secondary"
              className="bg-indigo-100 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-600"
            >
              FEATURES
            </Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              サクサク解いて身につく 3 つの仕掛け
            </h2>
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
              直感的な操作とテンポ感で、初日から手応えを感じられる学習体験をデザインしました。
            </p>
          </header>
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURE_CARDS.map((card) => (
              <FeatureHighlightCard
                key={card.title}
                icon={card.icon}
                title={card.title}
                description={card.description}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-8 rounded-3xl bg-white/8 px-8 py-12 text-left shadow-2xl shadow-indigo-900/40 backdrop-blur-lg sm:grid-cols-[0.62fr,1fr]">
          <div className="space-y-4">
            <Badge
              variant="outline"
              className="border-white/25 bg-white/10 text-xs font-semibold uppercase tracking-[0.35em] text-sky-200"
            >
              LEARNING FLOW
            </Badge>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              迷わない 3 ステップ学習フロー
            </h2>
            <p className="text-sm leading-relaxed text-indigo-100/80">
              「何をすればいいか」が明快だから、気持ちよく今日の学習を完走できます。小さな成功体験を積み重ねましょう。
            </p>
          </div>
          <ol className="space-y-4 text-indigo-100">
            {FLOW_STEPS.map((step) => (
              <FlowStepItem
                key={step.title}
                step={step.step}
                title={step.title}
                description={step.description}
              />
            ))}
          </ol>
        </section>

        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-700 px-8 py-12 text-center text-white shadow-2xl shadow-indigo-900/50">
          <h2 className="text-2xl font-bold sm:text-3xl">
            いますぐテンポ学習と復習サイクルを体験しよう
          </h2>
          <p className="mt-3 text-base text-indigo-100">
            ログインした瞬間に学習スタート。テンポ良く解いて、今日覚えた表現をすぐに会話へ持ち帰りましょう。復習タブで間違えた問題をまとめて振り返れば、定着のスピードも一段と上がります。
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-white text-indigo-600 hover:bg-indigo-50"
            >
              <a href="/login">ログインして始める</a>
            </Button>
            <span className="text-xs text-indigo-100/90">
              Google ログインで 30 秒ではじめられます
            </span>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 pb-12 pt-10 text-sm text-indigo-100/60">
        <div className="border-t border-white/10 pt-6">
          © {year} English Study Platform. 学習リズムを、もっと楽しく。
        </div>
      </footer>
    </div>
  );
}
