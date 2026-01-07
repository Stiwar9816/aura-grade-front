"use server";

import {LoginCredentials, RegisterData, User} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function loginAction(
	credentials: Pick<LoginCredentials, "email" | "password">
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
			const errorData = await response.json();
			return {error: errorData.message || "Credenciales incorrectas"};
		}

		const user: User = await response.json();
		return {success: true, user};
	} catch (error) {
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
			const errorData = await response.json();
			return {error: errorData.message || "Error en el registro"};
		}

		const user: User = await response.json();
		return {success: true, user};
	} catch (error) {
		return {error: "Error de conexión con el servidor"};
	}
}
