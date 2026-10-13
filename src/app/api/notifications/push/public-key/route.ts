import {NextRequest} from "next/server";
import {proxyAuthenticatedRest} from "@/lib/server/authenticatedRestProxy";

export const GET = (request: NextRequest) =>
	proxyAuthenticatedRest(request, "notifications/push/public-key", {
		method: "GET",
	});
