"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/shared/components/ui/button";

export function SubmitButton() {
  const status = useFormStatus();
  return (
    <Button type="submit" disabled={status.pending} className="min-w-32">
      {status.pending ? "保存中..." : "変更を保存"}
    </Button>
  );
}
