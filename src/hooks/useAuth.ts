import {useState, useEffect} from "react";
import {useRouter} from "next/router";
import {AuthState, LoginCredentials, RegisterData, User} from "@/types";

const useAuth = () => {
	const router = useRouter();
	const [authState, setAuthState] = useState<AuthState>({
		user: null,
		isAuthenticated: false,
		isLoading: true,
		error: null,
	});

	// Check authentication on mount
	useEffect(() => {
		const checkAuth = async () => {
			try {
				// Simular verificación de token
				await new Promise((resolve) => setTimeout(resolve, 500));

				const storedUser = localStorage.getItem("auraGrade_user");
				if (storedUser) {
					const user = JSON.parse(storedUser);
					setAuthState({
						user,
						isAuthenticated: true,
						isLoading: false,
						error: null,
					});
				} else {
					setAuthState((prev) => ({...prev, isLoading: false}));
				}
			} catch (error) {
				console.error("Auth check failed:", error);
				setAuthState({
					user: null,
					isAuthenticated: false,
					isLoading: false,
					error: "Error de autenticación",
				});
			}
		};

		checkAuth();
	}, []);

	const login = async (credentials: LoginCredentials) => {
		setAuthState((prev) => ({...prev, isLoading: true, error: null}));

		try {
			// Simulación de login
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Aquí iría la llamada real a la API
			const mockUser: User = {
				id: "1",
				email: credentials.email,
				name: "Demo",
				role: credentials.email.includes("teacher") ? "teacher" : "student",
			};

			if (credentials.rememberMe) {
				localStorage.setItem("auraGrade_user", JSON.stringify(mockUser));
			} else {
				sessionStorage.setItem("auraGrade_user", JSON.stringify(mockUser));
			}

			setAuthState({
				user: mockUser,
				isAuthenticated: true,
				isLoading: false,
				error: null,
			});

			// Redirigir según rol
			if (mockUser.role === "student") {
				router.push("/student");
			} else {
				router.push("/teacher");
			}

			return {success: true, user: mockUser};
		} catch (error) {
			const errorMessage =
				"Credenciales incorrectas. Por favor, verifica tus datos.";
			setAuthState((prev) => ({
				...prev,
				isLoading: false,
				error: errorMessage,
			}));
			return {success: false, error: errorMessage};
		}
	};

	const register = async (data: RegisterData) => {
		setAuthState((prev) => ({...prev, isLoading: true, error: null}));

		try {
			// Simulación de registro
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Aquí iría la llamada real a la API
			const mockUser: User = {
				id: "2",
				email: data.email,
				name: `${data.firstName} ${data.lastName}`,
				role: data.userType,
			};

			localStorage.setItem("auraGrade_user", JSON.stringify(mockUser));

			setAuthState({
				user: mockUser,
				isAuthenticated: true,
				isLoading: false,
				error: null,
			});

			// Redirigir según rol
			if (data.userType === "student") {
				router.push("/student");
			} else {
				router.push("/teacher");
			}

			return {success: true, user: mockUser};
		} catch (error) {
			const errorMessage =
				"Error en el registro. Por favor, intenta nuevamente.";
			setAuthState((prev) => ({
				...prev,
				isLoading: false,
				error: errorMessage,
			}));
			return {success: false, error: errorMessage};
		}
	};

	const logout = () => {
		localStorage.removeItem("auraGrade_user");
		sessionStorage.removeItem("auraGrade_user");

		setAuthState({
			user: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,
		});

		router.push("/login");
	};

	const updateUser = (updates: Partial<User>) => {
		if (authState.user) {
			const updatedUser = {...authState.user, ...updates};
			setAuthState((prev) => ({...prev, user: updatedUser}));

			// Persistir cambios
			const storedUser =
				localStorage.getItem("auraGrade_user") ||
				sessionStorage.getItem("auraGrade_user");
			if (storedUser) {
				const storage = localStorage.getItem("auraGrade_user")
					? localStorage
					: sessionStorage;
				storage.setItem("auraGrade_user", JSON.stringify(updatedUser));
			}
		}
	};

	const resetPassword = async (email: string) => {
		setAuthState((prev) => ({...prev, isLoading: true, error: null}));

		try {
			// Simulación de recuperación
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Aquí iría la llamada real a la API
			console.log("Password reset requested for:", email);

			setAuthState((prev) => ({...prev, isLoading: false}));
			return {success: true, message: "Instrucciones enviadas a tu correo."};
		} catch (error) {
			const errorMessage =
				"No pudimos procesar tu solicitud. Por favor, intenta nuevamente.";
			setAuthState((prev) => ({
				...prev,
				isLoading: false,
				error: errorMessage,
			}));
			return {success: false, error: errorMessage};
		}
	};

	return {
		...authState,
		login,
		register,
		logout,
		updateUser,
		resetPassword,
	};
};

export default useAuth;
