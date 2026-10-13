import {NextRequest, NextResponse} from "next/server";
import {
	fetchBackendRest,
	forwardedBackendHeaders,
} from "@/lib/server/backend";
import type {Institution} from "@/interface";

export async function GET(request: NextRequest) {
	try {
		const backendResponse = await fetchBackendRest(
			request,
			"institutions/public",
			{method: "GET"},
		);
		const data = (await backendResponse.json().catch(() => null)) as
			| Institution[]
			| {message?: string}
			| null;
		const headers = forwardedBackendHeaders(backendResponse);

		if (!backendResponse.ok || !Array.isArray(data)) {
			return NextResponse.json(
				{
					error:
						(data && !Array.isArray(data) && data.message) ||
						"No fue posible cargar las instituciones.",
				},
				{status: backendResponse.status || 502, headers},
			);
		}

		return NextResponse.json({institutions: data}, {headers});
	} catch {
		return NextResponse.json(
			{error: "El servicio de instituciones no está disponible."},
			{status: 503},
		);
	}
}
