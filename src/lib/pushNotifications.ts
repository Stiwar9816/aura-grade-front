const SERVICE_WORKER_PATH = "/aura-grade-sw.js";

const responseMessage = async (response: Response, fallback: string) => {
	const payload = (await response.json().catch(() => null)) as {
		error?: unknown;
		message?: unknown;
	} | null;
	const message = payload?.error ?? payload?.message;
	return typeof message === "string" ? message : fallback;
};

const urlBase64ToUint8Array = (value: string) => {
	const padding = "=".repeat((4 - (value.length % 4)) % 4);
	const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
	const raw = window.atob(base64);
	return Uint8Array.from(raw, (character) => character.charCodeAt(0));
};

const sameApplicationServerKey = (
	subscription: PushSubscription,
	publicKey: Uint8Array,
) => {
	const existing = subscription.options.applicationServerKey;
	if (!existing) return false;
	const existingBytes = new Uint8Array(existing);
	return (
		existingBytes.length === publicKey.length &&
		existingBytes.every((value, index) => value === publicKey[index])
	);
};

export const supportsWebPush = () =>
	typeof window !== "undefined" &&
	window.isSecureContext &&
	"Notification" in window &&
	"serviceWorker" in navigator &&
	"PushManager" in window;

const registerServiceWorker = async () => {
	await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {scope: "/"});
	return navigator.serviceWorker.ready;
};

export const subscribeToWebPush = async (): Promise<void> => {
	if (!supportsWebPush()) {
		throw new Error("Este navegador no admite Web Push en un contexto seguro.");
	}
	if (Notification.permission !== "granted") {
		throw new Error("El navegador no concedió permiso para mostrar notificaciones.");
	}

	const keyResponse = await fetch("/api/notifications/push/public-key", {
		credentials: "same-origin",
		cache: "no-store",
	});
	if (!keyResponse.ok) {
		throw new Error(
			await responseMessage(
				keyResponse,
				"Las notificaciones Web Push no están configuradas.",
			),
		);
	}
	const {publicKey} = (await keyResponse.json()) as {publicKey?: string};
	if (!publicKey) throw new Error("El servidor no entregó una clave Web Push válida.");

	const applicationServerKey = urlBase64ToUint8Array(publicKey);
	const registration = await registerServiceWorker();
	let subscription = await registration.pushManager.getSubscription();
	if (subscription && !sameApplicationServerKey(subscription, applicationServerKey)) {
		await subscription.unsubscribe();
		subscription = null;
	}
	if (!subscription) {
		subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey,
		});
	}

	const serialized = subscription.toJSON();
	if (!serialized.endpoint || !serialized.keys?.p256dh || !serialized.keys.auth) {
		await subscription.unsubscribe();
		throw new Error("El navegador generó una suscripción Web Push incompleta.");
	}

	const response = await fetch("/api/notifications/push/subscriptions", {
		method: "POST",
		credentials: "same-origin",
		headers: {"content-type": "application/json"},
		body: JSON.stringify(serialized),
	});
	if (!response.ok) {
		await subscription.unsubscribe();
		throw new Error(
			await responseMessage(response, "No fue posible registrar este dispositivo."),
		);
	}
};

export const unsubscribeFromWebPush = async (): Promise<void> => {
	if (!supportsWebPush()) return;
	const registration = await navigator.serviceWorker.getRegistration("/");
	const subscription = await registration?.pushManager.getSubscription();
	if (!subscription) return;

	try {
		await fetch("/api/notifications/push/subscriptions", {
			method: "DELETE",
			credentials: "same-origin",
			headers: {"content-type": "application/json"},
			body: JSON.stringify({endpoint: subscription.endpoint}),
		});
	} finally {
		await subscription.unsubscribe();
	}
};
