"use client";

import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

export interface DeleteConfirmDialogProps {
  trigger: ReactElement<{ disabled?: boolean }>;
  title: ReactNode;
  description: ReactNode;
  onConfirm: () => void;
  isPending?: boolean;
  errorMessage?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  confirmLabel?: string;
  confirmPendingLabel?: string;
  cancelLabel?: string;
  contentClassName?: string;
  footerClassName?: string;
}

export function DeleteConfirmDialog(props: DeleteConfirmDialogProps) {
  const {
    trigger,
    title,
    description,
    onConfirm,
    isPending = false,
    errorMessage,
    open,
    onOpenChange,
    confirmLabel = "削除する",
    confirmPendingLabel = "削除中...",
    cancelLabel = "キャンセル",
    contentClassName,
    footerClassName,
  } = props;

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const currentOpen = isControlled ? Boolean(open) : internalOpen;

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const triggerElement = useMemo(() => {
    if (!isValidElement<{ disabled?: boolean }>(trigger)) {
      throw new Error("DeleteConfirmDialog trigger must be a valid element");
    }

    const triggerProps = trigger.props;
    const existingDisabled =
      typeof triggerProps?.disabled === "boolean"
        ? triggerProps.disabled
        : false;

    return cloneElement(trigger, {
      disabled: existingDisabled || isPending,
    });
  }, [trigger, isPending]);

  return (
    <AlertDialog open={currentOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{triggerElement}</AlertDialogTrigger>
      <AlertDialogContent
        className={
          contentClassName ??
          "fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        }
      >
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-red-700">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-sm text-gray-600">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {errorMessage ? (
            <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
          ) : null}
          <AlertDialogFooter
            className={
              footerClassName ??
              "mt-6 flex flex-col-reverse gap-2 text-sm sm:flex-row sm:justify-end"
            }
          >
            <AlertDialogCancel disabled={isPending}>
              {cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                if (isPending) {
                  return;
                }
                onConfirm();
              }}
              className="bg-red-600 text-white hover:bg-red-500 disabled:bg-red-300"
            >
              {isPending ? confirmPendingLabel : confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
