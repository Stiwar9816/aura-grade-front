import { NextRequest } from "next/server";
import { proxyAuthenticatedRest } from "@/lib/server/authenticatedRestProxy";

export const runtime = "nodejs";

// Identity always comes from the session cookie; the browser sends no user id.
export const GET = (request: NextRequest) =>
	proxyAuthenticatedRest(request, "telegram/link", { method: "GET" });

export const DELETE = (request: NextRequest) =>
	proxyAuthenticatedRest(request, "telegram/link", { method: "DELETE" });
