import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { readSessionToken, clearSessionCookie } from "./authSession";
import { fetchBackendRest, forwardedBackendHeaders } from "./backend";

const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export type AcademicQueryParams = { courseId: string; segments: string[] };
const fail = (error: string, status: number) =>
  NextResponse.json(
    { error },
    {
      status,
      headers: {
        "cache-control": "no-store",
        "referrer-policy": "no-referrer",
      },
    },
  );

export async function handleAcademicQueries(
  request: NextRequest,
  params: AcademicQueryParams,
) {
  const sessionToken = readSessionToken(request);
  if (!sessionToken)
    return fail("Inicia sesión para consultar tus actividades.", 401);
  const parts = params.segments || [];
  const list = parts.length === 1 && parts[0] === "activities";
  const result =
    parts.length === 3 &&
    parts[0] === "activities" &&
    UUID.test(parts[1]) &&
    parts[2] === "result";
  if (!UUID.test(params.courseId) || (!list && !result))
    return fail("Consulta inválida.", 400);
  const search = new URL(request.url).searchParams;
  for (const [key, value] of search) {
    if (
      !list ||
      search.getAll(key).length !== 1 ||
      (key === "upcoming"
        ? !["true", "false"].includes(value)
        : !["page", "limit"].includes(key) ||
          !/^[1-9]\d*$/.test(value) ||
          Number(value) > (key === "limit" ? 50 : 100000))
    )
      return fail("Filtros inválidos.", 400);
  }
  try {
    const suffix = search.size ? `?${search}` : "";
    const backend = await fetchBackendRest(
      request,
      `courses/${params.courseId}/academic-queries/${parts.join("/")}${suffix}`,
      { method: "GET", sessionToken },
    );
    const headers = forwardedBackendHeaders(backend);
    headers.set("cache-control", "no-store");
    headers.set("referrer-policy", "no-referrer");
    headers.set("content-type", "application/json");
    const response = new NextResponse(await backend.arrayBuffer(), {
      status: backend.status,
      headers,
    });
    if (backend.status === 401) clearSessionCookie(response);
    return response;
  } catch {
    return fail(
      "No fue posible consultar tus actividades. Intenta nuevamente.",
      503,
    );
  }
}
