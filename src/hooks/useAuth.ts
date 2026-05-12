import {useState, useEffect} from "react";
import {AuthState, LoginCredentials, RegisterData, User} from "@/interface";
import {loginAction, registerAction} from "@/actions/auth";
import {isTokenExpired} from "@/utils/authUtils";

const getErrorMessage = (error: unknown, fallback: string) =>
	error instanceof Error
		? error.message
		: typeof error === "string"
			? error
			: fallback;

export const useAuth = () => {
	const [authState, setAuthState] = useState<AuthState>({
		user: null,
		isAuthenticated: false,
		isLoading: true,
		error: null,
	});

	const setAuthenticatedUser = (user: User) => {
		localStorage.setItem("auraGrade_user", JSON.stringify(user));
		window.dispatchEvent(new CustomEvent("auraGrade_user_updated"));
		setAuthState({
			user,
			isAuthenticated: true,
			isLoading: false,
			error: null,
		});
	};

	// Check authentication on mount using localStorage
	useEffect(() => {
		const checkAuth = () => {
			const storedUser = localStorage.getItem("auraGrade_user");
			if (storedUser) {
				try {
					const user = JSON.parse(storedUser);
					if (user.token && isTokenExpired(user.token)) {
						// Token expired
						console.log("Token expirado, cerrando sesión...");
						localStorage.removeItem("auraGrade_user");
						setAuthState({
							user: null,
							isAuthenticated: false,
							isLoading: false,
							error: null,
						});
					} else {
						// Token valid
						setAuthState({
							user,
							isAuthenticated: true,
							isLoading: false,
							error: null,
						});
					}
				} catch (error) {
					console.error("Error al verificar la autenticación:", error);
					localStorage.removeItem("auraGrade_user");
					setAuthState({
						user: null,
						isAuthenticated: false,
						isLoading: false,
						error: null,
					});
				}
			} else {
				setAuthState({
					user: null,
					isAuthenticated: false,
					isLoading: false,
					error: null,
				});
			}
		};

		checkAuth();

		const handleUserUpdated = () => {
			checkAuth();
		};

		window.addEventListener("auraGrade_user_updated", handleUserUpdated);
		window.addEventListener("storage", handleUserUpdated);

		// Optional: Periodic check
		const interval = setInterval(() => {
			const storedUser = localStorage.getItem("auraGrade_user");
			if (storedUser) {
				const user = JSON.parse(storedUser);
				if (user.token && isTokenExpired(user.token)) {
					console.log("La sesión expiró durante el uso");
					localStorage.removeItem("auraGrade_user");
					setAuthState({
						user: null,
						isAuthenticated: false,
						isLoading: false,
						error: null,
					});
					// Force redirect if needed, but state change might handle it
					window.location.href = "/login";
				}
			}
		}, 60000); // Check every minute

		return () => {
			clearInterval(interval);
			window.removeEventListener("auraGrade_user_updated", handleUserUpdated);
			window.removeEventListener("storage", handleUserUpdated);
		};
	}, []);

	const login = async (
		credentials: Pick<LoginCredentials, "email" | "password">,
	) => {
		setAuthState((prev) => ({...prev, isLoading: true, error: null}));

		try {
			const result = await loginAction(credentials);

			if (result.error) {
				setAuthState((prev) => ({
					...prev,
					isLoading: false,
					error: result.error!,
				}));
				return {success: false, error: result.error};
			}

			const user = result.user!;
			setAuthenticatedUser(user);

			return {success: true, user};
		} catch (error) {
			const message = getErrorMessage(error, "Error inesperado al iniciar sesión");
			setAuthState((prev) => ({
				...prev,
				isLoading: false,
				error: message,
			}));
			return {success: false, error: message};
		}
	};

	const register = async (data: RegisterData) => {
		setAuthState((prev) => ({...prev, isLoading: true, error: null}));

		try {
			const result = await registerAction(data);

			if (result.error) {
				setAuthState((prev) => ({
					...prev,
					isLoading: false,
					error: result.error!,
				}));
				return {success: false, error: result.error};
			}

			const user = result.user!;
			setAuthenticatedUser(user);

			return {success: true, user};
		} catch (error) {
			const message = getErrorMessage(error, "Error inesperado al registrarse");
			setAuthState((prev) => ({
				...prev,
				isLoading: false,
				error: message,
			}));
			return {success: false, error: message};
		}
	};

	const logout = () => {
		localStorage.removeItem("auraGrade_user");
		window.dispatchEvent(new CustomEvent("auraGrade_user_updated"));
		setAuthState({
			user: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,
		});
	};

	const updateUser = (updates: Partial<User>) => {
		if (!authState.user) return {success: false, error: "No hay sesión activa"};

		const updatedUser = {
			...authState.user,
			...updates,
		};

		setAuthenticatedUser(updatedUser);
		return {success: true, user: updatedUser};
	};

	return {
		...authState,
		login,
		register,
		logout,
		updateUser,
	};
};
