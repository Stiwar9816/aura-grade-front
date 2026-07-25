"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {UserRole} from "@/interface";
import {useAuth} from "@/hooks";
import {SessionError} from "@/components/Auth";

export default function HomePage() {
	const router = useRouter();
	const {user, isLoading, error, sessionErrorCode} = useAuth();

	useEffect(() => {
		if (isLoading) return;
		if (
			sessionErrorCode === "SERVICE_UNAVAILABLE" ||
			sessionErrorCode === "RATE_LIMITED"
		) {
			return;
		}
		if (!user) {
			router.push("/login");
			return;
		}

		if (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER) {
			router.push("/teacher");
		} else {
			router.push("/student");
		}
	}, [isLoading, router, sessionErrorCode, user]);

	if (
		sessionErrorCode === "SERVICE_UNAVAILABLE" ||
		sessionErrorCode === "RATE_LIMITED"
	) {
		return <SessionError code={sessionErrorCode} message={error} />;
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background-bone">
			<div className="text-center">
				<div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-500 mb-4"></div>
				<p className="text-gray-600">Redirigiendo...</p>
			</div>
		</div>
	);
}
