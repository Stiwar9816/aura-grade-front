import { NextRequest, NextResponse } from "next/server";
import { readSessionToken } from "@/lib/server/authSession";
import { fetchBackendRest } from "@/lib/server/backend";
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const sessionToken = readSessionToken(request);
	const headers = {
		"cache-control": "no-store",
		"referrer-policy": "no-referrer",
	};
	if (!sessionToken)
		return NextResponse.json(
			{ error: "Inicia sesión para descargar el documento." },
			{ status: 401, headers },
		);
	const { id } = await params;
	if (!/^[a-f0-9-]{36}$/i.test(id))
		return NextResponse.json(
			{ error: "Documento inválido." },
			{ status: 400, headers },
		);
	try {
		const backend = await fetchBackendRest(
			request,
			`submissions/${id}/download`,
			{ sessionToken },
		);
		const data = await backend.json();
		if (!backend.ok)
			return NextResponse.json(
				{ error: data.message || "Documento no disponible." },
				{ status: backend.status, headers },
			);
		const url = new URL(data.url);
		if (url.protocol !== "https:" || url.hostname !== "api.cloudinary.com")
			throw new Error("Invalid document host");
		return new NextResponse(null, {
			status: 302,
			headers: { ...headers, location: url.href },
		});
	} catch {
		return NextResponse.json(
			{ error: "No se pudo descargar el documento." },
			{ status: 503, headers },
		);
	}
}
