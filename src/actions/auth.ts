import {LoginCredentials, RegisterData, User} from "@/interface";

export type AuthErrorCode =
	| "FORBIDDEN"
	| "RATE_LIMITED"
	| "SERVICE_UNAVAILABLE"
	| "UNAUTHENTICATED";

type AuthResult = {
	challengeToken?: string;
	code?: AuthErrorCode;
	error?: string;
	expiresAt?: string;
	message?: string;
	pendingApproval?: boolean;
	otpAuthUri?: string;
	requiresTwoFactor?: boolean;
	requiresTwoFactorSetup?: boolean;
	retryAfter?: string;
	revokedSessions?: number;
	success?: boolean;
	setupKey?: string;
	user?: User;
};

export type ActiveSession = {
	absoluteExpiresAt: string;
	browser: string;
	createdAt: string;
	current: boolean;
	deviceType: "desktop" | "mobile" | "tablet" | "unknown";
	id: string;
	ipAddress?: string;
	lastActivityAt: string;
	name: string;
	operatingSystem: string;
	rememberMe: boolean;
};

let pendingSessionRequest: Promise<AuthResult> | null = null;

const readResponse = async (response: Response): Promise<AuthResult> => {
	try {
		const data = (await response.json()) as AuthResult;
		return {
			...data,
			retryAfter: response.headers.get("retry-after") || undefined,
		};
	} catch {
		return {retryAfter: response.headers.get("retry-after") || undefined};
	}
};

const responseError = (
	response: Response,
	result: AuthResult,
	fallback: string,
) => {
	if (response.status === 429) {
		return {
			code: "RATE_LIMITED" as const,
			error:
				result.error || "Demasiados intentos. Intenta nuevamente más tarde.",
			retryAfter: result.retryAfter,
		};
	}
	if (response.status === 503) {
		return {
			code: "SERVICE_UNAVAILABLE" as const,
			error:
				result.error ||
				"El servicio de autenticación no está disponible temporalmente.",
		};
	}
	if (response.status === 403) {
		return {
			code: "FORBIDDEN" as const,
			error: result.error || "No tienes permisos para realizar esta operación.",
		};
	}
	if (response.status === 401) {
		return {
			code: "UNAUTHENTICATED" as const,
			error: result.error || fallback,
		};
	}
	return {error: result.error || fallback};
};

export async function loginAction(
	credentials: Pick<LoginCredentials, "email" | "password" | "rememberMe">,
) {
	try {
		const response = await fetch("/api/auth/login", {
			method: "POST",
			headers: {"content-type": "application/json"},
			credentials: "same-origin",
			body: JSON.stringify(credentials),
		});
		const result = await readResponse(response);
		if (response.ok && result.requiresTwoFactor && result.challengeToken) {
			return {
				success: false,
				challengeToken: result.challengeToken,
				expiresAt: result.expiresAt,
				otpAuthUri: result.otpAuthUri,
				requiresTwoFactor: true,
				requiresTwoFactorSetup: result.requiresTwoFactorSetup,
				setupKey: result.setupKey,
			};
		}

		if (!response.ok || !result.user) {
			return {
				success: false,
				...responseError(response, result, "Credenciales incorrectas"),
			};
		}

		return {success: true, user: result.user};
	} catch {
		return {
			success: false,
			code: "SERVICE_UNAVAILABLE" as const,
			error: "Error de conexión con el servidor",
		};
	}
}

export async function verifyOtpAction(challengeToken: string, otp: string) {
	try {
		const response = await fetch("/api/auth/verify-otp", {
			method: "POST",
			headers: {"content-type": "application/json"},
			credentials: "same-origin",
			body: JSON.stringify({challengeToken, otp}),
		});
		const result = await readResponse(response);
		if (!response.ok || !result.user) {
			return {
				success: false,
				...responseError(response, result, "Código inválido o expirado."),
			};
		}
		return {success: true, user: result.user};
	} catch {
		return {
			success: false,
			code: "SERVICE_UNAVAILABLE" as const,
			error: "El servicio de segundo factor no está disponible.",
		};
	}
}

export async function registerAction(data: RegisterData) {
	try {
		const response = await fetch("/api/auth/register", {
			method: "POST",
			headers: {"content-type": "application/json"},
			credentials: "same-origin",
			body: JSON.stringify(data),
		});
		const result = await readResponse(response);

		if (!response.ok || !result.user) {
			return {
				success: false,
				...responseError(response, result, "Error en el registro"),
			};
		}

		return {
			success: true,
			user: result.user,
			pendingApproval: result.pendingApproval,
			message: result.message,
		};
	} catch {
		return {
			success: false,
			code: "SERVICE_UNAVAILABLE" as const,
			error: "Error de conexión con el servidor",
		};
	}
}

const requestSession = async (): Promise<AuthResult> => {
	try {
		const response = await fetch("/api/auth/session", {
			method: "GET",
			credentials: "same-origin",
			cache: "no-store",
		});
		const result = await readResponse(response);
		if (!response.ok || !result.user) {
			return {
				user: undefined,
				...responseError(response, result, "No fue posible validar la sesión."),
			};
		}
		return {user: result.user};
	} catch {
		return {
			user: undefined,
			code: "SERVICE_UNAVAILABLE",
			error: "No fue posible conectar con el servicio de sesiones.",
		};
	}
};

export const getSessionAction = (force = false) => {
	if (!force && pendingSessionRequest) return pendingSessionRequest;

	const request = requestSession();
	pendingSessionRequest = request;
	void request.finally(() => {
		if (pendingSessionRequest === request) pendingSessionRequest = null;
	});
	return request;
};

export async function logoutAction() {
	try {
		const response = await fetch("/api/auth/logout", {
			method: "POST",
			credentials: "same-origin",
		});
		const result = await readResponse(response);
		return response.ok
			? {success: true}
			: {
					success: false,
					...responseError(
						response,
						result,
						"No fue posible cerrar la sesión.",
					),
				};
	} catch {
		return {
			success: false,
			code: "SERVICE_UNAVAILABLE" as const,
			error: "No fue posible cerrar la sesión.",
		};
	}
}

export async function logoutAllAction() {
	try {
		const response = await fetch("/api/auth/logout-all", {
			method: "POST",
			credentials: "same-origin",
		});
		const result = await readResponse(response);
		if (!response.ok) {
			return {
				success: false,
				...responseError(
					response,
					result,
					"No fue posible cerrar todas las sesiones.",
				),
			};
		}
		return {
			success: true,
			revokedSessions: result.revokedSessions || 0,
		};
	} catch {
		return {
			success: false,
			code: "SERVICE_UNAVAILABLE" as const,
			error: "No fue posible cerrar todas las sesiones.",
		};
	}
}

export async function getActiveSessionsAction() {
	try {
		const response = await fetch("/api/auth/sessions", {
			method: "GET",
			credentials: "same-origin",
			cache: "no-store",
		});
		const result = (await response.json().catch(() => ({}))) as AuthResult & {
			sessions?: ActiveSession[];
		};
		if (!response.ok || !result.sessions) {
			return {
				success: false as const,
				...responseError(
					response,
					result,
					"No fue posible cargar los dispositivos con sesión activa.",
				),
			};
		}
		return {success: true as const, sessions: result.sessions};
	} catch {
		return {
			success: false as const,
			code: "SERVICE_UNAVAILABLE" as const,
			error: "No fue posible conectar con el servicio de sesiones.",
		};
	}
}

export async function revokeActiveSessionAction(sessionId: string) {
	try {
		const response = await fetch(
			`/api/auth/sessions/${encodeURIComponent(sessionId)}`,
			{
				method: "DELETE",
				credentials: "same-origin",
			},
		);
		const result = (await response.json().catch(() => ({}))) as AuthResult & {
			currentSession?: boolean;
			revoked?: boolean;
		};
		if (!response.ok || !result.success) {
			return {
				success: false as const,
				...responseError(
					response,
					result,
					"No fue posible cerrar la sesión seleccionada.",
				),
			};
		}
		return {
			currentSession: Boolean(result.currentSession),
			revoked: Boolean(result.revoked),
			success: true as const,
		};
	} catch {
		return {
			success: false as const,
			code: "SERVICE_UNAVAILABLE" as const,
			error: "No fue posible conectar con el servicio de sesiones.",
		};
	}
}

export async function updateSessionUserAction() {
	const result = await getSessionAction(true);
	if (!result.user) {
		return {
			success: false,
			code: result.code,
			error: result.error || "No hay sesión activa",
		};
	}
	return {success: true, user: result.user};
}

export async function forgotPasswordAction(email: string) {
	try {
		const response = await fetch("/api/auth/forgot-password", {
			method: "POST",
			headers: {"content-type": "application/json"},
			credentials: "same-origin",
			body: JSON.stringify({email}),
		});
		const data = (await response.json().catch(() => null)) as {
			error?: string;
			errors?: {message?: string}[];
		} | null;
		const graphQLError = data?.errors?.[0]?.message;

		if (!response.ok || graphQLError) {
			return {
				success: false,
				error:
					graphQLError ||
					data?.error ||
					"No fue posible enviar la nueva clave. Intenta nuevamente.",
			};
		}

		return {
			success: true,
			message: "Hemos enviado una nueva clave al correo electrónico indicado.",
		};
	} catch {
		return {
			success: false,
			error: "Error de conexión con el servidor",
		};
	}
}
