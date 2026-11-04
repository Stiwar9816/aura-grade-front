import { NextRequest } from "next/server";
import { proxyAuthenticatedRest } from "@/lib/server/authenticatedRestProxy";

export const runtime = "nodejs";

export const POST = (request: NextRequest) =>
	proxyAuthenticatedRest(request, "telegram/link/token", { method: "POST" });
