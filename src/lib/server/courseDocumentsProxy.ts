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
export type LibraryRouteParams = { courseId: string; segments?: string[] };
const privateHeaders = {
  "cache-control": "no-store",
  "referrer-policy": "no-referrer",
};
const failure = (error: string, status: number) =>
  NextResponse.json({ error }, { status, headers: privateHeaders });

export async function handleCourseDocuments(
  request: NextRequest,
  params: LibraryRouteParams,
  method: "GET" | "POST",
) {
  if (method !== "GET" && !isTrustedMutationRequest(request))
    return failure("Origen no permitido.", 403);
  const sessionToken = readSessionToken(request);
  if (!sessionToken)
    return failure("Inicia sesión para consultar la biblioteca.", 401);
  const parts = params.segments || [];
  const [documentId, section, versionId, action] = parts;
  const collection = parts.length === 0;
  const versions =
    parts.length === 2 && UUID.test(documentId) && section === "versions";
  const detail =
    parts.length === 3 &&
    UUID.test(documentId) &&
    section === "versions" &&
    UUID.test(versionId);
  const versionAction =
    parts.length === 4 &&
    UUID.test(documentId) &&
    section === "versions" &&
    UUID.test(versionId);
  const download = versionAction && action === "download" && method === "GET";
  const valid =
    UUID.test(params.courseId) &&
    (collection ||
      versions ||
      (method === "GET" && detail) ||
      download ||
      (method === "POST" &&
        versionAction &&
        ["review", "publish"].includes(action)) ||
      (method === "POST" &&
        parts.length === 2 &&
        UUID.test(documentId) &&
        section === "archive"));
  if (!valid) return failure("Ruta de biblioteca inválida.", 400);
  const search = new URL(request.url).searchParams;
  const pagination = new URLSearchParams();
  for (const [key, value] of search) {
    if (
      method !== "GET" ||
      (!collection && !versions) ||
      !["page", "limit"].includes(key) ||
      search.getAll(key).length !== 1 ||
      !/^[1-9]\d*$/.test(value) ||
      Number(value) > (key === "limit" ? 50 : 100000)
    )
      return failure("Paginación inválida.", 400);
    pagination.set(key, value);
  }
  const suffix = pagination.size ? `?${pagination}` : "";
  const path = `courses/${params.courseId}/documents${parts.length ? `/${parts.join("/")}` : ""}${suffix}`;
  try {
    const headers = new Headers();
    let body: ArrayBuffer | undefined;
    if (method === "POST") {
      const contentType = request.headers.get("content-type") || "";
      if (versions) {
        const key = request.headers.get("idempotency-key") || "";
        if (
          !UUID.test(key) ||
          !/^multipart\/form-data;\s*boundary=(?:"[^"]{1,70}"|[^\s;]{1,70})$/i.test(
            contentType,
          )
        )
          return failure(
            "Carga un archivo PDF o DOCX con una clave de subida válida.",
            400,
          );
        headers.set("idempotency-key", key);
        headers.set("content-type", contentType);
        body = await readLimitedBody(request, 16 * 1024 * 1024);
      } else {
        if (contentType && !/^application\/json(?:\s*;.*)?$/i.test(contentType))
          return failure("Se esperaba JSON.", 400);
        headers.set("content-type", "application/json");
        body = await readLimitedBody(request);
      }
    }
    const backend = await fetchBackendRest(request, path, {
      method,
      sessionToken,
      headers,
      body: body?.byteLength ? body : undefined,
    });
    const responseHeaders = forwardedBackendHeaders(backend);
    responseHeaders.set("referrer-policy", "no-referrer");
    if (download && backend.ok) {
      const data = await backend.json();
      const url = new URL(data.url);
      if (
        url.protocol !== "https:" ||
        url.hostname !== "api.cloudinary.com" ||
        url.username ||
        url.password ||
        url.port
      )
        throw new Error("Invalid document destination");
      responseHeaders.set("location", url.href);
      return new NextResponse(null, { status: 302, headers: responseHeaders });
    }
    responseHeaders.set(
      "content-type",
      backend.headers.get("content-type") || "application/json",
    );
    const response = new NextResponse(await backend.arrayBuffer(), {
      status: backend.status,
      headers: responseHeaders,
    });
    if (backend.status === 401) clearSessionCookie(response);
    return response;
  } catch (error) {
    if (error instanceof RequestBodyError)
      return failure(error.message, error.status);
    return failure(
      "No fue posible conectar con la biblioteca. Intenta nuevamente.",
      503,
    );
  }
}
