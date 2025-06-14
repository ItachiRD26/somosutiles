import * as React from "react";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast";

const TOAST_DURATION = 3000;

export function useToast() {
  const [toasts, setToasts] = React.useState<
    {
      id: string;
      title: string;
      description?: string;
      variant?: "default" | "success" | "destructive" | "warning";
      duration?: number;
    }[]
  >([]);

  const addToast = (toast: {
    title: string;
    description?: string;
    variant?: "default" | "success" | "destructive" | "warning";
    duration?: number;
  }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((current) => [
      ...current,
      {
        id,
        title: toast.title,
        description: toast.description,
        variant: toast.variant,
        duration: toast.duration ?? TOAST_DURATION,
      },
    ]);
  };

  const removeToast = (id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  };

  const ToastUI = () => (
    <ToastProvider>
      <ToastViewport className="fixed bottom-0 right-0 z-50 m-4 space-y-2" />
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          className={`${
            toast.variant === "success"
              ? "bg-green-600 text-white"
              : toast.variant === "destructive"
              ? "bg-red-600 text-white"
              : toast.variant === "warning"
              ? "bg-yellow-500 text-white"
              : "bg-gray-800 text-white"
          } border-none`}
          duration={toast.duration}
          onOpenChange={(open) => {
            if (!open) removeToast(toast.id);
          }}
        >
          <div className="grid gap-1">
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
    </ToastProvider>
  );

  return {
    toast: addToast,
    ToastUI,
  };
}
