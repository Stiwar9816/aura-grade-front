import "server-only";

import type {NextRequest, NextResponse} from "next/server";

const REMEMBER_ME_MAX_AGE = 60 * 60 * 24 * 30;

const configuredCookieName = process.env.SESSION_COOKIE_NAME || "ag_session";
export const SESSION_COOKIE_NAME =
	process.env.NODE_ENV === "production"
		? configuredCookieName.startsWith("__Host-")
			? configuredCookieName
			: `__Host-${configuredCookieName}`
		: configuredCookieName;

const secondsUntil = (expiresAt?: string) => {
	if (!expiresAt) return REMEMBER_ME_MAX_AGE;
	const seconds = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
	return Number.isFinite(seconds)
		? Math.max(0, Math.min(seconds, REMEMBER_ME_MAX_AGE))
		: REMEMBER_ME_MAX_AGE;
};

export const readSessionToken = (request: NextRequest) =>
	request.cookies.get(SESSION_COOKIE_NAME)?.value;

export const setSessionCookie = (
	response: NextResponse,
	sessionToken: string,
	options: {rememberMe?: boolean; expiresAt?: string} = {},
) => {
	response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		priority: "high",
		path: "/",
		...(options.rememberMe
			? {maxAge: secondsUntil(options.expiresAt)}
			: {}),
	});
};

export const clearSessionCookie = (response: NextResponse) => {
	response.cookies.set(SESSION_COOKIE_NAME, "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		priority: "high",
		path: "/",
		maxAge: 0,
	});
};
