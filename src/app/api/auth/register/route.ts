import {NextRequest, NextResponse} from "next/server";
import type {RegisterData, User} from "@/interface";
import {
	fetchBackendRest,
	forwardedBackendHeaders,
	isTrustedMutationRequest,
} from "@/lib/server/backend";
import {setSessionCookie} from "@/lib/server/authSession";

type BackendAuthResponse = {
	expiresAt?: string;
	message?: string;
	sessionToken?: string;
	token?: string;
	user?: User;
	pendingApproval?: boolean;
};

export async function POST(request: NextRequest) {
	if (!isTrustedMutationRequest(request)) {
		return NextResponse.json({error: "Origen no permitido."}, {status: 403});
	}

	try {
		const data = (await request.json()) as RegisterData;
		const payload: RegisterData = {
			name: data.name,
			last_name: data.last_name,
			document_type: data.document_type,
			document_num: data.document_num,
			phone: data.phone,
			email: data.email,
			password: data.password,
			role: data.role,
			institutionId: data.institutionId,
		};
		const backendResponse = await fetchBackendRest(request, "auth/register", {
			method: "POST",
			headers: {"content-type": "application/json"},
			body: JSON.stringify(payload),
		});
		const responseData = (await backendResponse.json().catch(() => null)) as
			| BackendAuthResponse
			| null;
		const responseHeaders = forwardedBackendHeaders(backendResponse);

		if (!backendResponse.ok || !responseData) {
			return NextResponse.json(
				{error: responseData?.message || "Error en el registro"},
				{status: backendResponse.status || 502, headers: responseHeaders},
			);
		}

		if (!responseData.user?.id) {
			return NextResponse.json(
				{error: "La respuesta de registro no contiene un usuario válido."},
				{status: 502, headers: responseHeaders},
			);
		}

		if (responseData.pendingApproval) {
			return NextResponse.json(
				{
					success: true,
					user: responseData.user,
					pendingApproval: true,
					message:
						responseData.message ||
						"Tu cuenta está pendiente de aprobación institucional.",
				},
				{status: 202, headers: responseHeaders},
			);
		}

		const sessionToken = responseData.sessionToken || responseData.token;
		if (!sessionToken) {
			return NextResponse.json(
				{error: "La respuesta de registro no contiene una sesión válida."},
				{status: 502, headers: responseHeaders},
			);
		}

		const response = NextResponse.json(
			{
				success: true,
				user: responseData.user,
				expiresAt: responseData.expiresAt,
			},
			{headers: responseHeaders},
		);
		setSessionCookie(response, sessionToken, {
			expiresAt: responseData.expiresAt,
		});
		return response;
	} catch {
		return NextResponse.json(
			{error: "El servicio de autenticación no está disponible."},
			{status: 502},
		);
	}
}
