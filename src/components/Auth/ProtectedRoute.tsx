import React, {useEffect} from "react";
import {useRouter} from "next/router";
import {useAuth} from "@/hooks";
import {ProtectedRouteProps, UserRole} from "@/interface";
import {SessionError} from "./SessionError";

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	requiredRole,
	requiredRoles,
	redirectTo = "/login",
}) => {
	const router = useRouter();
	const {user, isAuthenticated, isLoading, error, sessionErrorCode} = useAuth();

	useEffect(() => {
		if (!isLoading) {
			if (!isAuthenticated) {
				// No autenticado, redirigir a login
				router.push(redirectTo);
			} else if ((requiredRole || requiredRoles?.length) && user) {
				const allowedRoles = requiredRoles || [requiredRole as UserRole];
				const hasAccess = allowedRoles.includes(user.role);

				if (!hasAccess) {
					const userRole = user.role;
					// Rol incorrecto, redirigir al dashboard apropiado
					if (userRole === UserRole.STUDENT) {
						router.push("/student");
					} else if (userRole === UserRole.ADMIN) {
						router.push("/admin/approvals");
					} else if (userRole === UserRole.TEACHER) {
						router.push("/teacher");
					} else {
						router.push("/");
					}
				}
			}
		}
	}, [
		isAuthenticated,
		isLoading,
		user,
		requiredRole,
		requiredRoles,
		router,
		redirectTo,
	]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background-bone">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-500 mb-4"></div>
					<p className="text-gray-600">Verificando autenticación...</p>
				</div>
			</div>
		);
	}

	if (
		sessionErrorCode === "SERVICE_UNAVAILABLE" ||
		sessionErrorCode === "RATE_LIMITED"
	) {
		return <SessionError code={sessionErrorCode} message={error} />;
	}

	if (!isAuthenticated) {
		return null;
	}

	// Verificar acceso con roles exactos
	if ((requiredRole || requiredRoles?.length) && user) {
		const allowedRoles = requiredRoles || [requiredRole as UserRole];
		const hasAccess = allowedRoles.includes(user.role);

		if (!hasAccess) {
			return null;
		}
	}

	return <>{children}</>;
};
