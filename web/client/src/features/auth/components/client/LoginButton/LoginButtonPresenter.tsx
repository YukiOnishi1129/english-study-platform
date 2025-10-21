import { Button } from "@/shared/components/ui/button";

interface LoginButtonPresenterProps {
  onGoogleLogin: () => void;
}

export function LoginButtonPresenter({
  onGoogleLogin,
}: LoginButtonPresenterProps) {
  return (
    <Button onClick={onGoogleLogin} className="w-full" size="lg">
      Sign in with Google
    </Button>
  );
}
