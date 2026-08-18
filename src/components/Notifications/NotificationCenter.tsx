import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import {formatDistanceToNow} from "date-fns";
import {es} from "date-fns/locale";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBell, faCheckDouble, faSpinner} from "@fortawesome/free-solid-svg-icons";
import {useAuth, useNotificationCenter} from "@/hooks";
import type {InAppNotification} from "@/interface";

const safeNotificationUrl = (url: string) =>
	url.startsWith("/") && !url.startsWith("//") ? url : undefined;

const NotificationCenter = () => {
	const {user} = useAuth();
	const router = useRouter();
	const containerRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const {
		items,
		unreadCount,
		hasMore,
		loading,
		error,
		refresh,
		loadMore,
		markAsRead,
		markAllAsRead,
	} = useNotificationCenter(user?.id);

	useEffect(() => {
		if (!isOpen) return;
		const closeOnOutsideClick = (event: MouseEvent) => {
			if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsOpen(false);
		};
		document.addEventListener("mousedown", closeOnOutsideClick);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.removeEventListener("mousedown", closeOnOutsideClick);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [isOpen]);

	if (!user) return null;

	const toggle = () => {
		setIsOpen((open) => !open);
		if (!isOpen) void refresh();
	};

	const openNotification = async (notification: InAppNotification) => {
		try {
			await markAsRead(notification.id);
		} finally {
			setIsOpen(false);
			const url = safeNotificationUrl(notification.url);
			if (url) await router.push(url);
		}
	};

	return (
		<div className="relative" ref={containerRef}>
			<button
				type="button"
				onClick={toggle}
				className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
				aria-label={`Notificaciones${unreadCount ? `, ${unreadCount} sin leer` : ""}`}
				aria-expanded={isOpen}
			>
				<FontAwesomeIcon icon={faBell} />
				{unreadCount > 0 && (
					<span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
						{unreadCount > 99 ? "99+" : unreadCount}
					</span>
				)}
			</button>

			{isOpen && (
				<div className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
					<div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
						<div>
							<h2 className="font-semibold text-gray-900">Notificaciones</h2>
							<p className="text-xs text-gray-500">
								{unreadCount === 0
									? "Estás al día"
									: `${unreadCount} pendiente${unreadCount === 1 ? "" : "s"}`}
							</p>
						</div>
						<button
							type="button"
							onClick={() => void markAllAsRead()}
							disabled={unreadCount === 0}
							className="flex items-center gap-2 text-xs font-medium text-electric-600 disabled:cursor-not-allowed disabled:text-gray-400"
						>
							<FontAwesomeIcon icon={faCheckDouble} />
							Marcar todas
						</button>
					</div>

					<div className="max-h-[28rem] overflow-y-auto" aria-live="polite">
						{loading && items.length === 0 && (
							<div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-gray-500">
								<FontAwesomeIcon icon={faSpinner} spin />
								Cargando notificaciones...
							</div>
						)}

						{!loading && items.length === 0 && !error && (
							<div className="px-6 py-10 text-center">
								<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
									<FontAwesomeIcon icon={faBell} />
								</div>
								<p className="font-medium text-gray-800">No tienes notificaciones</p>
								<p className="mt-1 text-sm text-gray-500">
									Las nuevas entregas y calificaciones aparecerán aquí.
								</p>
							</div>
						)}

						{error && (
							<div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
								{error}
							</div>
						)}

						{items.map((notification) => {
							const isGradingFailure = notification.type === "GRADING_FAILED";
							return (
								<button
								key={notification.id}
								type="button"
								onClick={() => void openNotification(notification)}
								className={`flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
									notification.readAt
										? "bg-white"
										: isGradingFailure
											? "bg-red-50/70"
											: "bg-electric-50/60"
								}`}
							>
								<span
									className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
										notification.readAt
											? "bg-gray-300"
											: isGradingFailure
												? "bg-red-500"
												: "bg-electric-500"
									}`}
								/>
								<span className="min-w-0 flex-1">
									<span className="block font-medium text-gray-900">
										{notification.title}
									</span>
									<span className="mt-0.5 block text-sm leading-5 text-gray-600">
										{notification.body}
									</span>
									<span className="mt-1 block text-xs text-gray-400">
										{formatDistanceToNow(new Date(notification.createdAt), {
											addSuffix: true,
											locale: es,
										})}
									</span>
								</span>
								</button>
							);
						})}

						{hasMore && (
							<button
								type="button"
								onClick={() => void loadMore()}
								disabled={loading}
								className="w-full px-4 py-3 text-sm font-medium text-electric-600 hover:bg-gray-50 disabled:text-gray-400"
							>
								{loading ? "Cargando..." : "Ver anteriores"}
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default NotificationCenter;
