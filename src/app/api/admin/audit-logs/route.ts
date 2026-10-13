import {NextRequest} from "next/server";
import {proxyAuthenticatedRest} from "@/lib/server/authenticatedRestProxy";

export function GET(request: NextRequest) {
	const query = request.nextUrl.searchParams.toString();
	return proxyAuthenticatedRest(
		request,
		`audit-logs${query ? `?${query}` : ""}`,
		{method: "GET"},
	);
}
