import { NextRequest } from "next/server";
import { proxyAuthenticatedRest } from "@/lib/server/authenticatedRestProxy";
export const POST = (request: NextRequest) =>
	proxyAuthenticatedRest(request, "auth/recovery-codes", { method: "POST" });
