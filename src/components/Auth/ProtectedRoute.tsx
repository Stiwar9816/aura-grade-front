import React, {useEffect} from "react";
import {useRouter} from "next/router";
import useAuth from "@/hooks/useAuth";
import {ProtectedRouteProps} from "@/types";

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	requiredRole,
	redirectTo = "/login",
}) => {
	const router = useRouter();
	const {user, isAuthenticated, isLoading} = useAuth();

	useEffect(() => {
		if (!isLoading) {
			if (!isAuthenticated) {
				// No autenticado, redirigir a login
				router.push(
					`${redirectTo}?redirect=${encodeURIComponent(router.asPath)}`
				);
			} else if (requiredRole && user) {
				// Normalizar roles para comparación
				const userRole = user.role.toLowerCase();
				const normalizedRequired = requiredRole.toLowerCase();

				// Administrador tiene acceso a rutas de teacher
				const hasAccess =
					userRole === normalizedRequired ||
					(normalizedRequired === "teacher" && userRole === "administrador");

				if (!hasAccess) {
					// Rol incorrecto, redirigir al dashboard apropiado
					if (userRole === "student") {
						router.push("/student");
					} else if (userRole === "teacher" || userRole === "administrador") {
						router.push("/teacher");
					} else {
						router.push("/");
					}
				}
			}
		}
	}, [isAuthenticated, isLoading, user, requiredRole, router, redirectTo]);

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

	if (!isAuthenticated) {
		return null;
	}

	// Verificar acceso con roles normalizados
	if (requiredRole && user) {
		const userRole = user.role.toLowerCase();
		const normalizedRequired = requiredRole.toLowerCase();
		const hasAccess =
			userRole === normalizedRequired ||
			(normalizedRequired === "teacher" && userRole === "administrador");

		if (!hasAccess) {
			return null;
		}
	}

	return <>{children}</>;
};

export default ProtectedRoute;
