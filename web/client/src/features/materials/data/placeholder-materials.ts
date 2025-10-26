export interface PlaceholderMaterialChapter {
  id: string;
  name: string;
  description: string;
  unitCount: number;
  focus: string;
  sampleUnitId?: string;
}

export interface PlaceholderMaterial {
  id: string;
  name: string;
  description: string;
  unitCount: number;
  totalQuestions: number;
  masteryRate: number; // 0-1
  updatedAt: string;
  chapters: PlaceholderMaterialChapter[];
}

export const placeholderMaterials: PlaceholderMaterial[] = [
  {
    id: "f3a9ba8c-4368-4643-83cb-b7cb9450e1e2",
    name: "英会話フレーズ 基礎編",
    description:
      "あいさつや自己紹介など、日常会話で必須となる定型フレーズを集中的にトレーニングします。",
    unitCount: 12,
    totalQuestions: 144,
    masteryRate: 0.38,
    updatedAt: "2024-02-10",
    chapters: [
      {
        id: "chapter-basic-greetings",
        name: "第1章 基本のあいさつ",
        description:
          "「おはよう」「こんにちは」など、会話の入口となるフレーズを反復して定着させます。",
        unitCount: 4,
        focus: "呼びかけ・相手の調子を尋ねる",
        sampleUnitId: "1fd17435-c11c-4c12-b5a0-4958e0d6abaa",
      },
      {
        id: "chapter-self-introduction",
        name: "第2章 自己紹介",
        description:
          "初対面での会話を想定し、自己紹介や趣味の話題展開に使える表現を学びます。",
        unitCount: 3,
        focus: "自己紹介・相手への質問",
      },
      {
        id: "chapter-small-talk",
        name: "第3章 スモールトーク",
        description:
          "天気や週末の予定など、会話のつなぎに役立つスモールトークのストックを増やします。",
        unitCount: 5,
        focus: "日常会話・場面別フレーズ",
      },
    ],
  },
  {
    id: "material-business-communication",
    name: "ビジネス英語コミュニケーション",
    description:
      "会議・プレゼン・メールなどビジネスシーンで求められる表現をシチュエーション別に習得します。",
    unitCount: 18,
    totalQuestions: 220,
    masteryRate: 0.24,
    updatedAt: "2024-01-28",
    chapters: [
      {
        id: "chapter-meeting",
        name: "第1章 ミーティングで使う表現",
        description:
          "会議の進行・意見表明・合意形成に必要な表現をケーススタディ形式で学びます。",
        unitCount: 6,
        focus: "会議進行・意思決定",
      },
      {
        id: "chapter-presentation",
        name: "第2章 プレゼンテーション",
        description:
          "導入〜クロージングまでの流れに沿って、伝わるプレゼン表現を練習します。",
        unitCount: 5,
        focus: "発表・質疑応答",
      },
      {
        id: "chapter-email",
        name: "第3章 ビジネスメール",
        description:
          "丁寧な依頼や調整、トラブル時の連絡など、メールで頻出のフォーマットをストックします。",
        unitCount: 7,
        focus: "メール・ドキュメント",
      },
    ],
  },
  {
    id: "material-travel-english",
    name: "トラベル英会話",
    description:
      "空港・ホテル・レストランなどの場面で困らないよう、旅行で必要な英語フレーズを身につけます。",
    unitCount: 10,
    totalQuestions: 132,
    masteryRate: 0.56,
    updatedAt: "2023-12-15",
    chapters: [
      {
        id: "chapter-airport",
        name: "第1章 空港・飛行機",
        description:
          "チェックインから入国審査、機内での会話まで、空港での一連の流れを想定しています。",
        unitCount: 3,
        focus: "移動・手続き",
        sampleUnitId: "travel-unit-airport-basic",
      },
      {
        id: "chapter-hotel",
        name: "第2章 ホテルでの会話",
        description:
          "チェックインや設備の問い合わせなど、ホテル滞在に必要なフレーズをまとめています。",
        unitCount: 3,
        focus: "宿泊・トラブル対応",
      },
      {
        id: "chapter-dining",
        name: "第3章 レストラン",
        description:
          "予約、注文、会計までレストランで頻出の表現をダイアログ形式で練習します。",
        unitCount: 4,
        focus: "飲食・リクエスト",
      },
    ],
  },
];

export function findPlaceholderMaterial(
  id: string,
): PlaceholderMaterial | null {
  return placeholderMaterials.find((material) => material.id === id) ?? null;
}
