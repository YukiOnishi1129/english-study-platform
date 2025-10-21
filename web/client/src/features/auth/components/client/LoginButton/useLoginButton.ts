import { signIn } from "next-auth/react";
import { useCallback } from "react";

export function useLoginButton() {
  const handleGoogleLogin = useCallback(() => {
    signIn("google", { callbackUrl: "/dashboard" });
  }, []);

  return {
    handleGoogleLogin,
  };
}
