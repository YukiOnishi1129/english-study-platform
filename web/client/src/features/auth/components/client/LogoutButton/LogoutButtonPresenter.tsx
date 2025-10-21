import { Button } from "@/shared/components/ui/button";

interface LogoutButtonPresenterProps {
  onLogout: () => void;
}

export function LogoutButtonPresenter({
  onLogout,
}: LogoutButtonPresenterProps) {
  return (
    <Button type="button" onClick={onLogout} variant="destructive">
      Sign out
    </Button>
  );
}
