"use client";

import { signIn } from "next-auth/react";
import { useCallback } from "react";

export function useLoginButton() {
  const handleGoogleLogin = useCallback(() => {
    void signIn("google", { callbackUrl: "/" });
  }, []);

  return {
    handleGoogleLogin,
  };
}
