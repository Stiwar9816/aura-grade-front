import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { readSessionToken, clearSessionCookie } from "./authSession";
import {
  fetchBackendRest,
  forwardedBackendHeaders,
  isTrustedMutationRequest,
} from "./backend";
import { readLimitedBody, RequestBodyError } from "./requestBody";
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export type AssistantParams = { courseId: string; segments: string[] };
const fail = (message: string, status: number) =>
  NextResponse.json(
    { message },
    {
      status,
      headers: {
        "cache-control": "no-store",
        "referrer-policy": "no-referrer",
      },
    },
  );
export async function handleCourseAssistant(
  request: NextRequest,
  params: AssistantParams,
) {
  const sessionToken = readSessionToken(request);
  if (!sessionToken) return fail("Inicia sesión para usar el asistente.", 401);
  const p = params.segments || [];
  const status = p.length === 1 && p[0] === "sources";
  const ask = p.length === 1 && p[0] === "questions";
  const prepare =
    p.length === 3 &&
    p[0] === "sources" &&
    UUID.test(p[1]) &&
    p[2] === "prepare";
  if (
    !UUID.test(params.courseId) ||
    (!status && !ask && !prepare) ||
    new URL(request.url).search
  )
    return fail("Consulta inválida.", 400);
  if (request.method !== (status ? "GET" : "POST"))
    return fail("Método no permitido.", 405);
  if (!status && !isTrustedMutationRequest(request))
    return fail("Origen no permitido.", 403);
  let body: string | undefined;
  try {
    if (!status) {
      const raw = new TextDecoder().decode(
        await readLimitedBody(request, 8192),
      );
      let input: Record<string, unknown>;
      try {
        input = JSON.parse(raw || "{}");
      } catch {
        return fail("JSON inválido.", 400);
      }
      if (!input || typeof input !== "object" || Array.isArray(input))
        return fail("Consulta inválida.", 400);
      if (ask) {
        if (
          Object.keys(input).some((k) => k !== "question") ||
          typeof input.question !== "string" ||
          input.question.trim().length < 3 ||
          input.question.length > 1000
        )
          return fail("Escribe una pregunta de 3 a 1000 caracteres.", 400);
        body = JSON.stringify({ question: input.question.trim() });
      } else if (Object.keys(input).length)
        return fail("No se admiten parámetros adicionales.", 400);
    }
    const backend = await fetchBackendRest(
      request,
      `courses/${params.courseId}/assistant/${p.join("/")}`,
      {
        method: request.method,
        sessionToken,
        ...(body
          ? { body, headers: { "Content-Type": "application/json" } }
          : {}),
      },
    );
    const headers = forwardedBackendHeaders(backend);
    headers.set("cache-control", "no-store");
    headers.set("content-type", "application/json");
    headers.set("referrer-policy", "no-referrer");
    const response = new NextResponse(await backend.arrayBuffer(), {
      status: backend.status,
      headers,
    });
    if (backend.status === 401) clearSessionCookie(response);
    return response;
  } catch (error) {
    return error instanceof RequestBodyError
      ? fail(error.message, error.status)
      : fail("No fue posible consultar el asistente. Intenta más tarde.", 503);
  }
}
