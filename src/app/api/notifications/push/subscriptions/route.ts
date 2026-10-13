import {NextRequest} from "next/server";
import {proxyAuthenticatedRest} from "@/lib/server/authenticatedRestProxy";

export const POST = (request: NextRequest) =>
	proxyAuthenticatedRest(request, "notifications/push/subscriptions", {
		method: "POST",
	});

export const DELETE = (request: NextRequest) =>
	proxyAuthenticatedRest(request, "notifications/push/subscriptions", {
		method: "DELETE",
	});
