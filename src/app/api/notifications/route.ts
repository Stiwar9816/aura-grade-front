import {NextRequest} from "next/server";
import {proxyAuthenticatedRest} from "@/lib/server/authenticatedRestProxy";

export const GET = (request: NextRequest) => {
	const query = request.nextUrl.searchParams.toString();
	return proxyAuthenticatedRest(
		request,
		`notifications${query ? `?${query}` : ""}`,
		{method: "GET"},
	);
};
