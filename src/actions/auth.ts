"use server";

import {LoginCredentials, RegisterData, User} from "@/interface";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const GRAPHQL_API_URL =
	process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:3000/graphql";

type AuthResponseBody = Partial<User> & {
	errors?: {message?: string}[];
	message?: string;
	user?: User;
	token?: string;
};

const readResponseBody = async (
	response: Response,
): Promise<AuthResponseBody | null> => {
	try {
		return await response.json();
	} catch {
		return null;
	}
};

export async function loginAction(
	credentials: Pick<LoginCredentials, "email" | "password">,
) {
	try {
		const response = await fetch(`${API_URL}/auth/login`, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({
				email: credentials.email,
				password: credentials.password,
			}),
		});

		if (!response.ok) {
			const errorData = await readResponseBody(response);
			return {error: errorData?.message || "Credenciales incorrectas"};
		}

		const data = (await response.json()) as AuthResponseBody;

		// Normalizar respuesta si viene anidada { user, token }
		let user: User;
		if (data.user && data.token) {
			user = {...data.user, token: data.token};
		} else {
			user = data as User;
		}

		return {success: true, user};
	} catch {
		return {error: "Error de conexión con el servidor"};
	}
}

export async function registerAction(data: RegisterData) {
	try {
		const response = await fetch(`${API_URL}/auth/register`, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({
				name: data.name,
				last_name: data.last_name,
				email: data.email,
				password: data.password,
				role: data.role,
				document_type: data.document_type || "Cedula de ciudadania",
				document_num: data.document_num || 0,
				phone: data.phone || 0,
			}),
		});

		if (!response.ok) {
			const errorData = await readResponseBody(response);
			return {error: errorData?.message || "Error en el registro"};
		}

		const responseData = (await response.json()) as AuthResponseBody;

		// Normalizar respuesta si viene anidada { user, token }
		let user: User;
		if (responseData.user && responseData.token) {
			user = {...responseData.user, token: responseData.token};
		} else {
			user = responseData as User;
		}

		return {success: true, user};
	} catch {
		return {error: "Error de conexión con el servidor"};
	}
}

export async function forgotPasswordAction(email: string) {
	try {
		const response = await fetch(GRAPHQL_API_URL, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({
				query: `
					mutation ResetPassword($resetPassword: String!) {
						resetPassword(resetPassword: $resetPassword) {
							id
							name
							last_name
							email
							password
						}
					}
				`,
				variables: {resetPassword: email},
			}),
		});

		const data = await readResponseBody(response);
		const graphQLError = data?.errors?.[0]?.message;

		if (!response.ok || graphQLError) {
			return {
				success: false,
				error:
					graphQLError ||
					data?.message ||
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
