import { Loader2Icon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

function Spinner({
  className,
  ...props
}: React.ComponentProps<typeof Loader2Icon>) {
  return (
    <span
      className="inline-flex items-center"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2Icon
        aria-hidden="true"
        className={cn("size-4 animate-spin", className)}
        {...props}
      />
      <span className="sr-only">Loading</span>
    </span>
  );
}

export { Spinner };
