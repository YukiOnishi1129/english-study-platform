interface LoginButtonPresenterProps {
  onGoogleLogin: () => void;
}

export function LoginButtonPresenter({
  onGoogleLogin,
}: LoginButtonPresenterProps) {
  return (
    <button
      type="button"
      onClick={onGoogleLogin}
      className="w-full rounded-md bg-blue-600 px-4 py-2 text-lg font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Googleでサインイン
    </button>
  );
}
