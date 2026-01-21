import {useState, useEffect} from "react";
import {AuthState, LoginCredentials, RegisterData} from "@/types";
import {loginAction, registerAction} from "@/actions/auth";
import {isTokenExpired} from "@/utils/authUtils";

const useAuth = () => {
	const [authState, setAuthState] = useState<AuthState>({
		user: null,
		isAuthenticated: false,
		isLoading: true,
		error: null,
	});

	// Check authentication on mount using localStorage
	useEffect(() => {
		const checkAuth = () => {
			const storedUser = localStorage.getItem("auraGrade_user");
			if (storedUser) {
				try {
					const user = JSON.parse(storedUser);
					if (user.token && isTokenExpired(user.token)) {
						// Token expired
						console.log("Token expired, logging out...");
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

		// Optional: Periodic check
		const interval = setInterval(() => {
			const storedUser = localStorage.getItem("auraGrade_user");
			if (storedUser) {
				const user = JSON.parse(storedUser);
				if (user.token && isTokenExpired(user.token)) {
					console.log("Session expired during usage");
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

		return () => clearInterval(interval);
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
			localStorage.setItem("auraGrade_user", JSON.stringify(user));

			setAuthState({
				user,
				isAuthenticated: true,
				isLoading: false,
				error: null,
			});

			return {success: true, user};
		} catch (error) {
			setAuthState((prev) => ({
				...prev,
				isLoading: false,
				error: "Error inesperado al iniciar sesión",
			}));
			return {success: false, error: "Error inesperado"};
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
			localStorage.setItem("auraGrade_user", JSON.stringify(user));

			setAuthState({
				user,
				isAuthenticated: true,
				isLoading: false,
				error: null,
			});

			return {success: true, user};
		} catch (error) {
			setAuthState((prev) => ({
				...prev,
				isLoading: false,
				error: "Error inesperado al registrarse",
			}));
			return {success: false, error: "Error inesperado"};
		}
	};

	const logout = () => {
		localStorage.removeItem("auraGrade_user");
		setAuthState({
			user: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,
		});
	};

	return {
		...authState,
		login,
		register,
		logout,
	};
};

export default useAuth;
