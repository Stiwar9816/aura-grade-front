import type { AuthErrorCode } from "@/actions/auth";

export interface SessionErrorProps {
	code: Extract<AuthErrorCode, "RATE_LIMITED" | "SERVICE_UNAVAILABLE">;
	message?: string | null;
}