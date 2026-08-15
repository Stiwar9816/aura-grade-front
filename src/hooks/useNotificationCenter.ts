import {useCallback, useEffect, useState} from "react";
import type {NotificationPage} from "@/interface";

const REFRESH_INTERVAL_MS = 30_000;
const NOTIFICATION_CHANNEL = "auraGrade_notification_center";

const emptyPage: NotificationPage = {
	items: [],
	page: 1,
	limit: 20,
	total: 0,
	unreadCount: 0,
	hasMore: false,
};

const responseError = async (response: Response, fallback: string) => {
	try {
		const body = (await response.json()) as {message?: string; error?: string};
		return body.message || body.error || fallback;
	} catch {
		return fallback;
	}
};

const notifyOtherTabs = () => {
	if (typeof BroadcastChannel === "undefined") return;
	const channel = new BroadcastChannel(NOTIFICATION_CHANNEL);
	channel.postMessage("changed");
	channel.close();
};

export const useNotificationCenter = (userId?: string) => {
	const [data, setData] = useState<NotificationPage>(emptyPage);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchPage = useCallback(
		async (page: number, append = false) => {
			if (!userId) {
				setData(emptyPage);
				return;
			}

			setLoading(true);
			try {
				const response = await fetch(`/api/notifications?page=${page}&limit=20`, {
					credentials: "same-origin",
					cache: "no-store",
				});
				if (!response.ok) {
					throw new Error(
						await responseError(response, "No se pudieron cargar las notificaciones."),
					);
				}

				const next = (await response.json()) as NotificationPage;
				setData((current) => ({
					...next,
					items: append ? [...current.items, ...next.items] : next.items,
				}));
				setError(null);
			} catch (requestError) {
				setError(
					requestError instanceof Error
						? requestError.message
						: "No se pudieron cargar las notificaciones.",
				);
			} finally {
				setLoading(false);
			}
		},
		[userId],
	);

	const refresh = useCallback(() => fetchPage(1), [fetchPage]);
	const loadMore = useCallback(
		() => fetchPage(data.page + 1, true),
		[data.page, fetchPage],
	);

	const markAsRead = useCallback(async (id: string) => {
		const notification = data.items.find((item) => item.id === id);
		if (!notification || notification.readAt) return;

		const readAt = new Date().toISOString();
		setData((current) => ({
			...current,
			unreadCount: Math.max(0, current.unreadCount - 1),
			items: current.items.map((item) =>
				item.id === id ? {...item, readAt} : item,
			),
		}));

		try {
			const response = await fetch(
				`/api/notifications/${encodeURIComponent(id)}/read`,
				{
					method: "PATCH",
					credentials: "same-origin",
				},
			);
			if (!response.ok) {
				throw new Error(
					await responseError(
						response,
						"No se pudo marcar la notificación como leída.",
					),
				);
			}
			setError(null);
			notifyOtherTabs();
		} catch (requestError) {
			setError(
				requestError instanceof Error
					? requestError.message
					: "No se pudo marcar la notificación como leída.",
			);
			await refresh();
		}
	}, [data.items, refresh]);

	const markAllAsRead = useCallback(async () => {
		if (data.unreadCount === 0) return;
		const readAt = new Date().toISOString();
		setData((current) => ({
			...current,
			unreadCount: 0,
			items: current.items.map((item) => ({...item, readAt: item.readAt || readAt})),
		}));

		try {
			const response = await fetch("/api/notifications/read-all", {
				method: "PATCH",
				credentials: "same-origin",
			});
			if (!response.ok) {
				throw new Error(
					await responseError(response, "No se pudieron marcar las notificaciones."),
				);
			}
			setError(null);
			notifyOtherTabs();
		} catch (requestError) {
			setError(
				requestError instanceof Error
					? requestError.message
					: "No se pudieron marcar las notificaciones.",
			);
			await refresh();
		}
	}, [data.unreadCount, refresh]);

	useEffect(() => {
		if (!userId) {
			setData(emptyPage);
			return;
		}

		void refresh();
		const interval = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
		const onFocus = () => void refresh();
		window.addEventListener("focus", onFocus);

		let channel: BroadcastChannel | undefined;
		if (typeof BroadcastChannel !== "undefined") {
			channel = new BroadcastChannel(NOTIFICATION_CHANNEL);
			channel.addEventListener("message", onFocus);
		}

		return () => {
			window.clearInterval(interval);
			window.removeEventListener("focus", onFocus);
			channel?.removeEventListener("message", onFocus);
			channel?.close();
		};
	}, [refresh, userId]);

	return {
		...data,
		loading,
		error,
		refresh,
		loadMore,
		markAsRead,
		markAllAsRead,
	};
};
