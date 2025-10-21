"use client";

import { signOut } from "next-auth/react";
import { useCallback } from "react";

export function useLogoutButton() {
  const handleLogout = useCallback(() => {
    void signOut({ callbackUrl: "/login" });
  }, []);

  return {
    handleLogout,
  };
}
