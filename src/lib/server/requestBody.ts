import "server-only";
export class RequestBodyError extends Error {
	constructor(
		message: string,
		public status: number,
	) {
		super(message);
	}
}
export async function readLimitedBody(
	request: Request,
	maxBytes = 1024 * 1024,
): Promise<ArrayBuffer> {
	const declared = request.headers.get("content-length");
	if (declared && (!/^\d+$/.test(declared) || Number(declared) > maxBytes))
		throw new RequestBodyError("La solicitud supera el tamaño permitido.", 413);
	const reader = request.body?.getReader();
	if (!reader) return new ArrayBuffer(0);
	let size = 0;
	const chunks: Uint8Array[] = [];
	let timedOut = false;
	const timer = setTimeout(() => {
		timedOut = true;
		void reader.cancel().catch(() => {});
	}, 30000);
	try {
		while (true) {
			const result = await reader.read();
			if (timedOut)
				throw new RequestBodyError(
					"El envío tardó demasiado. Intenta nuevamente.",
					408,
				);
			if (result.done) break;
			size += result.value.byteLength;
			if (size > maxBytes)
				throw new RequestBodyError(
					"La solicitud supera el tamaño permitido.",
					413,
				);
			chunks.push(result.value);
		}
		const body = new Uint8Array(size);
		let offset = 0;
		for (const chunk of chunks) {
			body.set(chunk, offset);
			offset += chunk.byteLength;
		}
		return body.buffer;
	} finally {
		clearTimeout(timer);
		await reader.cancel().catch(() => {});
	}
}
export async function readLimitedJson(request: Request) {
	try {
		const value = JSON.parse(
			new TextDecoder().decode(await readLimitedBody(request)),
		);
		if (!value || typeof value !== "object" || Array.isArray(value))
			throw new RequestBodyError("Se esperaba un objeto JSON.", 400);
		return value;
	} catch (error) {
		if (error instanceof RequestBodyError) throw error;
		throw new RequestBodyError("El cuerpo JSON no es válido.", 400);
	}
}
