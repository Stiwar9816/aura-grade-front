import {useCallback, useEffect, useState} from "react";
import {
	DEFAULT_NOTIFICATION_PREFERENCES,
	type NotificationPreferences,
} from "@/interface";

const PREFERENCES_UPDATED_EVENT = "auraGrade_notification_preferences_updated";

const cacheKey = (userId?: string) =>
	`auraGrade_notification_preferences_${userId || "anonymous"}`;

const normalizedPreferences = (
	value?: Partial<NotificationPreferences> | null,
): NotificationPreferences => ({
	...DEFAULT_NOTIFICATION_PREFERENCES,
	...value,
});

const readCachedPreferences = (userId?: string) => {
	if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFERENCES;

	try {
		const value = window.localStorage.getItem(cacheKey(userId));
		return value
			? normalizedPreferences(JSON.parse(value) as Partial<NotificationPreferences>)
			: DEFAULT_NOTIFICATION_PREFERENCES;
	} catch {
		return DEFAULT_NOTIFICATION_PREFERENCES;
	}
};

const cachePreferences = (
	userId: string | undefined,
	preferences: NotificationPreferences,
) => {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(cacheKey(userId), JSON.stringify(preferences));
	window.dispatchEvent(
		new CustomEvent(PREFERENCES_UPDATED_EVENT, {detail: preferences}),
	);
};

const responseMessage = async (response: Response, fallback: string) => {
	const payload = (await response.json().catch(() => null)) as {
		error?: unknown;
		message?: unknown;
	} | null;
	const message = payload?.error ?? payload?.message;
	return typeof message === "string" ? message : fallback;
};

export const useNotificationPreferences = (userId?: string) => {
	const [preferences, setPreferences] = useState<NotificationPreferences>(
		DEFAULT_NOTIFICATION_PREFERENCES,
	);
	const [loading, setLoading] = useState(Boolean(userId));
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!userId) {
			setPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
			setLoading(false);
			return;
		}

		let active = true;
		setPreferences(readCachedPreferences(userId));
		setLoading(true);
		setError(null);

		void fetch("/api/notifications/preferences", {
			credentials: "same-origin",
			cache: "no-store",
		})
			.then(async (response) => {
				if (!response.ok) {
					throw new Error(
						await responseMessage(
							response,
							"No fue posible cargar las preferencias de notificación.",
						),
					);
				}
				return response.json() as Promise<NotificationPreferences>;
			})
			.then((payload) => {
				if (!active) return;
				const nextPreferences = normalizedPreferences(payload);
				setPreferences(nextPreferences);
				cachePreferences(userId, nextPreferences);
			})
			.catch((loadError: unknown) => {
				if (active) {
					setError(
						loadError instanceof Error
							? loadError.message
							: "No fue posible cargar las preferencias de notificación.",
					);
				}
			})
			.finally(() => {
				if (active) setLoading(false);
			});

		const handleUpdate = (event: Event) => {
			const nextPreferences = (event as CustomEvent<NotificationPreferences>)
				.detail;
			if (nextPreferences) setPreferences(normalizedPreferences(nextPreferences));
		};
		const handleStorage = (event: StorageEvent) => {
			if (event.key === cacheKey(userId)) {
				setPreferences(readCachedPreferences(userId));
			}
		};
		window.addEventListener(PREFERENCES_UPDATED_EVENT, handleUpdate);
		window.addEventListener("storage", handleStorage);

		return () => {
			active = false;
			window.removeEventListener(PREFERENCES_UPDATED_EVENT, handleUpdate);
			window.removeEventListener("storage", handleStorage);
		};
	}, [userId]);

	const savePreferences = useCallback(
		async (nextPreferences: NotificationPreferences) => {
			if (!userId) throw new Error("No hay una sesión activa.");
			setSaving(true);
			setError(null);
			try {
				const response = await fetch("/api/notifications/preferences", {
					method: "PATCH",
					credentials: "same-origin",
					headers: {"content-type": "application/json"},
					body: JSON.stringify(nextPreferences),
				});
				if (!response.ok) {
					throw new Error(
						await responseMessage(
							response,
							"No fue posible guardar las preferencias de notificación.",
						),
					);
				}
				const saved = normalizedPreferences(
					(await response.json()) as NotificationPreferences,
				);
				setPreferences(saved);
				cachePreferences(userId, saved);
				return saved;
			} catch (saveError) {
				const message =
					saveError instanceof Error
						? saveError.message
						: "No fue posible guardar las preferencias de notificación.";
				setError(message);
				throw saveError;
			} finally {
				setSaving(false);
			}
		},
		[userId],
	);

	return {
		preferences,
		setPreferences,
		savePreferences,
		loading,
		saving,
		error,
	};
};
