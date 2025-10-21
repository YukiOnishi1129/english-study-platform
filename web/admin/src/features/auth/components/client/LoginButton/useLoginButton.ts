"use client";

import { useCallback } from "react";
import { signIn } from "next-auth/react";

export function useLoginButton() {
  const handleGoogleLogin = useCallback(() => {
    void signIn("google", { callbackUrl: "/" });
  }, []);

  return {
    handleGoogleLogin,
  };
}
