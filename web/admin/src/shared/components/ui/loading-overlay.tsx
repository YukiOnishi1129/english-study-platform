"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Spinner } from "./spinner";

interface LoadingOverlayProps {
  isOpen: boolean;
  label?: string;
}

export function LoadingOverlay({
  isOpen,
  label = "処理を実行しています…",
}: LoadingOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/75 backdrop-blur">
      <output
        aria-live="assertive"
        aria-busy="true"
        className="flex items-center gap-3 rounded-md bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-lg"
      >
        <Spinner className="text-indigo-600" />
        {label}
      </output>
    </div>,
    document.body,
  );
}
