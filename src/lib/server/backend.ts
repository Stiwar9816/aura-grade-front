import "server-only";

import {randomUUID} from "node:crypto";

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;
const TRACEPARENT_PATTERN = /^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/i;

const legacyApiUrl =
	process.env.API_URL ||
	"http://localhost:3000/api";
const legacyGraphqlUrl =
	process.env.GRAPHQL_API_URL ||
	"http://localhost:3000/graphql";

const backendOrigin = process.env.AURA_GRADE_API_URL?.replace(/\/+$/, "");

export const backendRestUrl = (path: string) =>
	backendOrigin
		? `${backendOrigin}/api/${path.replace(/^\/+/, "")}`
		: `${legacyApiUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

export const backendGraphqlUrl = () =>
	backendOrigin ? `${backendOrigin}/graphql` : legacyGraphqlUrl;

const getBffSecret = () => {
	const secret =
		process.env.AURA_GRADE_BFF_SECRET || process.env.BFF_SHARED_SECRET;

	if (process.env.NODE_ENV === "production" && !secret) {
		throw new Error("AURA_GRADE_BFF_SECRET no está configurado.");
	}

	return secret;
};

const trustedHeader = (
	request: Request,
	name: string,
	pattern: RegExp,
) => {
	const value = request.headers.get(name);
	return value && pattern.test(value) ? value : undefined;
};

export const getRequestContext = (request: Request) => ({
	requestId:
		trustedHeader(request, "x-request-id", REQUEST_ID_PATTERN) || randomUUID(),
	traceparent: trustedHeader(request, "traceparent", TRACEPARENT_PATTERN),
});

export type BackendFetchOptions = Omit<RequestInit, "headers"> & {
	duplex?: "half";
	headers?: HeadersInit;
	sessionToken?: string;
};

const backendFetch = (
	request: Request,
	url: string,
	options: BackendFetchOptions = {},
) => {
	const context = getRequestContext(request);
	const headers = new Headers(options.headers);
	const bffSecret = getBffSecret();
	const {sessionToken, ...requestOptions} = options;

	headers.set("x-request-id", context.requestId);
	if (context.traceparent) headers.set("traceparent", context.traceparent);
	if (bffSecret) headers.set("x-bff-secret", bffSecret);
	if (sessionToken) {
		headers.set("authorization", `Bearer ${sessionToken}`);
	}

	return fetch(url, {
		...requestOptions,
		headers,
		cache: "no-store",
	} as RequestInit & {duplex?: "half"});
};

export const fetchBackendRest = (
	request: Request,
	path: string,
	options: BackendFetchOptions = {},
) => backendFetch(request, backendRestUrl(path), options);

export const fetchBackendGraphql = (
	request: Request,
	options: BackendFetchOptions = {},
) => backendFetch(request, backendGraphqlUrl(), options);

export const forwardedBackendHeaders = (response: Response) => {
	const headers = new Headers({"cache-control": "no-store"});

	for (const name of ["x-request-id", "traceparent", "retry-after"]) {
		const value = response.headers.get(name);
		if (value) headers.set(name, value);
	}

	return headers;
};

export const isTrustedMutationRequest = (request: Request) => {
	const origin = request.headers.get("origin");
	if (!origin) return true;

	try {
		return new URL(origin).origin === new URL(request.url).origin;
	} catch {
		return false;
	}
};
