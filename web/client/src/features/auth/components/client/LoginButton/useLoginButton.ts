import { useCallback } from "react";

export function useLoginButton() {
  const handleGoogleLogin = useCallback(() => {
    window.location.href = "/api/auth/google";
  }, []);

  return {
    handleGoogleLogin,
  };
}
