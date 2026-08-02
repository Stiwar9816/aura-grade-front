import { toast, type ExternalToast } from "sonner";

type ToastType = "success" | "error" | "warning" | "info";
type ToastOptions = ExternalToast;

const DEFAULT_OPTIONS: ToastOptions = {
  duration: 3500,
  position: "bottom-right",
};

const TOAST_OPTIONS_BY_TYPE: Record<ToastType, ToastOptions> = {
  success: { duration: 4500 },
  error: { duration: 6500 },
  warning: { duration: 5500 },
  info: { duration: 5000 },
};

const TOAST_BY_TYPE = {
  success: toast.success,
  error: toast.error,
  warning: toast.warning,
  info: toast.info,
} satisfies Record<ToastType, typeof toast.success>;

export const notify = (
  type: ToastType,
  message: string,
  options: ToastOptions = {},
) => {
  if (typeof window === "undefined") return;

  TOAST_BY_TYPE[type](message, {
    ...DEFAULT_OPTIONS,
    ...TOAST_OPTIONS_BY_TYPE[type],
    ...options,
  });
};

export const notifySuccess = (message: string, options?: ToastOptions) =>
  notify("success", message, options);

export const notifyError = (message: string, options?: ToastOptions) =>
  notify("error", message, options);

export const notifyWarning = (message: string, options?: ToastOptions) =>
  notify("warning", message, options);

export const notifyInfo = (message: string, options?: ToastOptions) =>
  notify("info", message, options);

export const notifyLoading = (message: string, options: ToastOptions = {}) => {
  if (typeof window === "undefined") return undefined;

  return toast.loading(message, {
    ...DEFAULT_OPTIONS,
    duration: Number.POSITIVE_INFINITY,
    ...options,
  });
};
