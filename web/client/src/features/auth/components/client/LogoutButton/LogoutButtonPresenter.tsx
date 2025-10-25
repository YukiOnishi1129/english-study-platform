import { Button } from "@/shared/components/ui/button";

interface LogoutButtonPresenterProps {
  onLogout: () => void;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}

export function LogoutButtonPresenter({
  onLogout,
  className,
  variant = "destructive",
}: LogoutButtonPresenterProps) {
  return (
    <Button
      type="button"
      onClick={onLogout}
      variant={variant}
      className={className}
    >
      サインアウト
    </Button>
  );
}
