export interface PhraseQuestionParams {
  questionId: string;
  promptJa: string;
  promptEn?: string | null;
  hint?: string | null;
  explanation?: string | null;
  audioUrl?: string | null;
}

export class PhraseQuestion {
  public readonly questionId: string;
  public readonly promptJa: string;
  public readonly promptEn: string | null;
  public readonly hint: string | null;
  public readonly explanation: string | null;
  public readonly audioUrl: string | null;

  constructor(params: PhraseQuestionParams) {
    this.questionId = params.questionId;
    this.promptJa = params.promptJa;
    this.promptEn = params.promptEn ?? null;
    this.hint = params.hint ?? null;
    this.explanation = params.explanation ?? null;
    this.audioUrl = params.audioUrl ?? null;
  }
}
