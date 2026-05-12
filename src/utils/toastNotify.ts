import {showToast, type ToastOptions} from "nextjs-toast-notify";

type ToastType = "success" | "error" | "warning" | "info";

const DEFAULT_OPTIONS: ToastOptions = {
	duration: 3500,
	progress: true,
	position: "bottom-right",
	transition: "slideInUp",
	sound: false,
};

const TOAST_OPTIONS_BY_TYPE: Record<ToastType, ToastOptions> = {
	success: {
		duration: 4500,
		transition: "bounceIn",
	},
	error: {
		duration: 6500,
		transition: "popUp",
	},
	warning: {
		duration: 5500,
		transition: "topBounce",
	},
	info: {
		duration: 5000,
		transition: "slideInUp",
	},
};

const escapeToastMessage = (message: string) =>
	message
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");

export const notify = (
	type: ToastType,
	message: string,
	options: ToastOptions = {},
) => {
	if (typeof window === "undefined") return;

	showToast[type](escapeToastMessage(message), {
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
