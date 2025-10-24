export interface QuestionDeleteButtonPresenterProps {
  supportingText: string;
  isPending: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  onDelete: () => void;
}

export function QuestionDeleteButtonPresenter(
  props: QuestionDeleteButtonPresenterProps,
) {
  const { supportingText, isPending, errorMessage, successMessage, onDelete } =
    props;

  return (
    <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-red-700">削除</h3>
          <p className="text-xs text-red-600">{supportingText}</p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
        >
          {isPending ? "削除中..." : "問題を削除"}
        </button>
      </div>
      {errorMessage ? (
        <p className="text-xs text-red-700">{errorMessage}</p>
      ) : null}
      {successMessage ? (
        <p className="text-xs text-emerald-700">{successMessage}</p>
      ) : null}
    </div>
  );
}
