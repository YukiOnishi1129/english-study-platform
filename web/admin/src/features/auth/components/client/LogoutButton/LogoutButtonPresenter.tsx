interface LogoutButtonPresenterProps {
  onLogout: () => void;
}

export function LogoutButtonPresenter({
  onLogout,
}: LogoutButtonPresenterProps) {
  return (
    <button
      type="button"
      onClick={onLogout}
      className="w-full rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      サインアウト
    </button>
  );
}
