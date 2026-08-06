"use client";

import React, {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import {
	getSessionAction,
	loginAction,
	logoutAllAction,
	logoutAction,
	registerAction,
	updateSessionUserAction,
} from "@/actions/auth";
import {AuthState, LoginCredentials, RegisterData, User} from "@/interface";
import {unsubscribeFromWebPush} from "@/lib/pushNotifications";

const AUTH_CHANNEL_NAME = "auraGrade_auth";

export interface AuthContextType extends AuthState {
	login: (
		credentials: Pick<
			LoginCredentials,
			"email" | "password" | "rememberMe"
		>,
	) => Promise<{success: boolean; user?: User; error?: string}>;
	register: (
		data: RegisterData,
	) => Promise<{
		success: boolean;
		user?: User;
		error?: string;
		message?: string;
		pendingApproval?: boolean;
	}>;
	logout: () => Promise<{success: boolean; error?: string}>;
	logoutAll: () => Promise<{
		success: boolean;
		revokedSessions?: number;
		error?: string;
	}>;
	updateUser: (
		updates: Partial<User>,
	) => Promise<{success: boolean; user?: User; error?: string}>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getErrorMessage = (error: unknown, fallback: string) =>
	error instanceof Error
		? error.message
		: typeof error === "string"
			? error
			: fallback;

interface AuthProviderProps {
	children: ReactNode;
}

const notifyOtherTabs = () => {
	if (typeof BroadcastChannel === "undefined") return;
	const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
	channel.postMessage("session-updated");
	channel.close();
};

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
	const [authState, setAuthState] = useState<AuthState>({
		user: null,
		isAuthenticated: false,
		isLoading: true,
		error: null,
		sessionErrorCode: null,
	});

	useEffect(() => {
		let active = true;
		const refreshSession = () => {
			void getSessionAction().then((result) => {
				if (!active) return;
				setAuthState({
					user: result.user || null,
					isAuthenticated: Boolean(result.user),
					isLoading: false,
					error:
						result.code === "SERVICE_UNAVAILABLE" ||
						result.code === "RATE_LIMITED"
							? result.error || null
							: null,
					sessionErrorCode:
						result.code === "SERVICE_UNAVAILABLE" ||
						result.code === "RATE_LIMITED" ||
						result.code === "UNAUTHENTICATED"
							? result.code
							: null,
				});
			});
		};

		refreshSession();

		if (typeof BroadcastChannel === "undefined") {
			return () => {
				active = false;
			};
		}
		const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
		channel.addEventListener("message", refreshSession);
		return () => {
			active = false;
			channel.removeEventListener("message", refreshSession);
			channel.close();
		};
	}, []);

	const login = useCallback(
		async (
			credentials: Pick<
				LoginCredentials,
				"email" | "password" | "rememberMe"
			>,
		) => {
			setAuthState((previous) => ({
				...previous,
				isLoading: true,
				error: null,
				sessionErrorCode: null,
			}));

			try {
				const result = await loginAction(credentials);
				if (!result.user) {
					const error = result.error || "Credenciales incorrectas";
					setAuthState((previous) => ({
						...previous,
						isLoading: false,
						error,
						sessionErrorCode: null,
					}));
					return {success: false, error};
				}

				setAuthState({
					user: result.user,
					isAuthenticated: true,
					isLoading: false,
					error: null,
					sessionErrorCode: null,
				});
				notifyOtherTabs();
				return {success: true, user: result.user};
			} catch (error) {
				const message = getErrorMessage(
					error,
					"Error inesperado al iniciar sesión",
				);
				setAuthState((previous) => ({
					...previous,
					isLoading: false,
					error: message,
					sessionErrorCode: null,
				}));
				return {success: false, error: message};
			}
		},
		[],
	);

	const register = useCallback(async (data: RegisterData) => {
		setAuthState((previous) => ({
			...previous,
			isLoading: true,
			error: null,
			sessionErrorCode: null,
		}));

		try {
			const result = await registerAction(data);
			if (!result.user) {
				const error = result.error || "Error en el registro";
				setAuthState((previous) => ({
					...previous,
					isLoading: false,
					error,
					sessionErrorCode: null,
				}));
				return {success: false, error};
			}

			if (result.pendingApproval) {
				setAuthState({
					user: null,
					isAuthenticated: false,
					isLoading: false,
					error: null,
					sessionErrorCode: null,
				});
				return {
					success: true,
					user: result.user,
					pendingApproval: true,
					message: result.message,
				};
			}

			setAuthState({
				user: result.user,
				isAuthenticated: true,
				isLoading: false,
				error: null,
				sessionErrorCode: null,
			});
			notifyOtherTabs();
			return {success: true, user: result.user};
		} catch (error) {
			const message = getErrorMessage(error, "Error inesperado al registrarse");
			setAuthState((previous) => ({
				...previous,
				isLoading: false,
				error: message,
				sessionErrorCode: null,
			}));
			return {success: false, error: message};
		}
	}, []);

	const logout = useCallback(async () => {
		await unsubscribeFromWebPush().catch(() => undefined);
		const result = await logoutAction();
		setAuthState({
			user: null,
			isAuthenticated: false,
			isLoading: false,
			error: "error" in result ? result.error || null : null,
			sessionErrorCode: null,
		});
		notifyOtherTabs();
		return result;
	}, []);

	const logoutAll = useCallback(async () => {
		await unsubscribeFromWebPush().catch(() => undefined);
		const result = await logoutAllAction();
		if (result.success) {
			setAuthState({
				user: null,
				isAuthenticated: false,
				isLoading: false,
				error: null,
				sessionErrorCode: null,
			});
			notifyOtherTabs();
		}
		return result;
	}, []);

	const updateUser = useCallback(async (updates: Partial<User>) => {
		void updates;
		const result = await updateSessionUserAction();
		if (!result.user) {
			return {
				success: false,
				error: result.error || "No hay sesión activa",
			};
		}

		setAuthState({
			user: result.user,
			isAuthenticated: true,
			isLoading: false,
			error: null,
			sessionErrorCode: null,
		});
		notifyOtherTabs();
		return {success: true, user: result.user};
	}, []);

	const value = useMemo(
		() => ({
			...authState,
			login,
			register,
			logout,
			logoutAll,
			updateUser,
		}),
		[authState, login, logout, logoutAll, register, updateUser],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
