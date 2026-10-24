import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";
const nativeRequire = createRequire(import.meta.url);
const cache = new Map();
function load(file) {
  const full = path.resolve(file);
  if (cache.has(full)) return cache.get(full).exports;
  const code = ts.transpileModule(
    readFileSync(full, "utf8").replace(/import "server-only";/g, ""),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  const mod = { exports: {} };
  cache.set(full, mod);
  new Function("require", "module", "exports", code)(
    (id) => {
      if (!id.startsWith(".") && !id.startsWith("@/")) return nativeRequire(id);
      const target = id.startsWith("@/")
        ? path.resolve("src", id.slice(2))
        : path.resolve(path.dirname(full), id);
      return load(
        existsSync(`${target}.ts`)
          ? `${target}.ts`
          : existsSync(`${target}.tsx`)
            ? `${target}.tsx`
            : target,
      );
    },
    mod,
    mod.exports,
  );
  return mod.exports;
}
const courseId = "00000000-0000-4000-8000-000000000001";
const documentId = "00000000-0000-4000-8000-000000000002";
const versionId = "00000000-0000-4000-8000-000000000003";
const { NextRequest } = nativeRequire("next/server");
const request = (pathSuffix = "", init = {}) =>
  new NextRequest(
    `https://aura.example/api/courses/${courseId}/documents${pathSuffix}`,
    {
      ...init,
      headers: { cookie: "ag_session=valid-session", ...init.headers },
    },
  );

test("library BFF rejects absent sessions, foreign mutation origins and unsupported paths before contacting backend", async () => {
  const { handleCourseDocuments } = load(
    "src/lib/server/courseDocumentsProxy.ts",
  );
  const original = global.fetch;
  let calls = 0;
  global.fetch = async () => {
    calls++;
    return Response.json({});
  };
  try {
    assert.equal(
      (
        await handleCourseDocuments(
          request("", { headers: { cookie: "" } }),
          { courseId },
          "GET",
        )
      ).status,
      401,
    );
    assert.equal(
      (
        await handleCourseDocuments(
          request("", {
            method: "POST",
            headers: { origin: "https://evil.example" },
            body: "{}",
          }),
          { courseId },
          "POST",
        )
      ).status,
      403,
    );
    for (const segments of [
      ["..", "users"],
      [documentId, "versions", versionId, "delete"],
      [documentId, "versions", "wrong"],
    ]) {
      assert.equal(
        (await handleCourseDocuments(request(), { courseId, segments }, "GET"))
          .status,
        400,
      );
    }
    assert.equal(calls, 0);
  } finally {
    global.fetch = original;
  }
});

test("library BFF preserves multipart bytes and idempotency while deriving credentials from the cookie", async () => {
  const { handleCourseDocuments } = load(
    "src/lib/server/courseDocumentsProxy.ts",
  );
  const original = global.fetch;
  const originalSecret = process.env.AURA_GRADE_BFF_SECRET;
  process.env.AURA_GRADE_BFF_SECRET = "server-secret";
  let captured;
  global.fetch = async (url, options) => {
    captured = { url, options };
    return Response.json({ id: versionId }, { status: 201 });
  };
  try {
    const bytes = Buffer.from([45, 45, 97, 13, 10, 0, 255, 128]);
    const response = await handleCourseDocuments(
      request("", {
        method: "POST",
        body: bytes,
        headers: {
          "content-type": "multipart/form-data; boundary=a",
          "idempotency-key": versionId,
          authorization: "Bearer attacker",
          "x-bff-secret": "attacker",
        },
      }),
      { courseId, segments: [documentId, "versions"] },
      "POST",
    );
    assert.equal(response.status, 201);
    assert.deepEqual(Buffer.from(captured.options.body), bytes);
    assert.equal(
      captured.options.headers.get("authorization"),
      "Bearer valid-session",
    );
    assert.equal(captured.options.headers.get("x-bff-secret"), "server-secret");
    assert.equal(captured.options.headers.get("idempotency-key"), versionId);
    assert.equal(
      captured.options.headers.get("content-type"),
      "multipart/form-data; boundary=a",
    );
    assert.equal(response.headers.get("cache-control"), "no-store");
  } finally {
    global.fetch = original;
    if (originalSecret === undefined) delete process.env.AURA_GRADE_BFF_SECRET;
    else process.env.AURA_GRADE_BFF_SECRET = originalSecret;
  }
});

test("library BFF bounds uploads and rejects invalid pagination, upload keys and content types", async () => {
  const { handleCourseDocuments } = load(
    "src/lib/server/courseDocumentsProxy.ts",
  );
  const original = global.fetch;
  let calls = 0;
  global.fetch = async () => {
    calls++;
    return Response.json({});
  };
  try {
    for (const headers of [
      {
        "content-type": "multipart/form-data; boundary=a",
        "idempotency-key": "bad",
      },
      { "content-type": "application/json", "idempotency-key": versionId },
    ])
      assert.equal(
        (
          await handleCourseDocuments(
            request("", { method: "POST", body: "x", headers }),
            { courseId, segments: [documentId, "versions"] },
            "POST",
          )
        ).status,
        400,
      );
    assert.equal(
      (
        await handleCourseDocuments(
          request("", {
            method: "POST",
            body: "x",
            headers: {
              "content-type": "multipart/form-data; boundary=a",
              "idempotency-key": versionId,
              "content-length": String(17 * 1024 * 1024),
            },
          }),
          { courseId, segments: [documentId, "versions"] },
          "POST",
        )
      ).status,
      413,
    );
    for (const query of [
      "?page=0",
      "?limit=51",
      "?page=1&page=2",
      "?userId=someone",
    ])
      assert.equal(
        (await handleCourseDocuments(request(query), { courseId }, "GET"))
          .status,
        400,
      );
    assert.equal(calls, 0);
  } finally {
    global.fetch = original;
  }
});

test("library downloads validate the signed destination and preserve backend denial", async () => {
  const { handleCourseDocuments } = load(
    "src/lib/server/courseDocumentsProxy.ts",
  );
  const original = global.fetch;
  const params = {
    courseId,
    segments: [documentId, "versions", versionId, "download"],
  };
  try {
    global.fetch = async () =>
      Response.json({
        url: "https://api.cloudinary.com/v1_1/demo/raw/download?signature=example",
      });
    const good = await handleCourseDocuments(request(), params, "GET");
    assert.equal(good.status, 302);
    assert.equal(good.headers.get("referrer-policy"), "no-referrer");
    for (const url of [
      "javascript:alert(1)",
      "https://evil.example/file",
      "https://api.cloudinary.com@evil.example/file",
      "http://api.cloudinary.com/file",
    ]) {
      global.fetch = async () => Response.json({ url });
      assert.equal(
        (await handleCourseDocuments(request(), params, "GET")).status,
        503,
      );
    }
    global.fetch = async () =>
      Response.json({ message: "Sin matrícula" }, { status: 403 });
    assert.equal(
      (await handleCourseDocuments(request(), params, "GET")).status,
      403,
    );
    global.fetch = async () =>
      Response.json({ message: "Sesión vencida" }, { status: 401 });
    const expired = await handleCourseDocuments(request(), params, "GET");
    assert.match(expired.headers.get("set-cookie"), /Max-Age=0/i);
  } finally {
    global.fetch = original;
  }
});

test("library client preserves API errors and sends uploads without exposing credentials or fixing a boundary", async () => {
  const { libraryRequest, uploadLibraryFile } = load(
    "src/lib/courseLibrary.ts",
  );
  const original = global.fetch;
  let captured;
  try {
    global.fetch = async (url, options) => {
      captured = { url, options };
      return Response.json({ id: versionId });
    };
    const file = new File(["%PDF-demo"], "guide.pdf", {
      type: "application/pdf",
    });
    await uploadLibraryFile("/api/library", file, versionId);
    assert.ok(captured.options.body instanceof FormData);
    assert.equal(captured.options.body.get("file").name, "guide.pdf");
    assert.equal(
      new Headers(captured.options.headers).get("idempotency-key"),
      versionId,
    );
    assert.equal(
      new Headers(captured.options.headers).get("content-type"),
      null,
    );
    assert.equal(
      new Headers(captured.options.headers).get("authorization"),
      null,
    );
    global.fetch = async () =>
      Response.json({ message: ["Documento ya existe"] }, { status: 409 });
    await assert.rejects(
      libraryRequest("/api/library"),
      (error) =>
        error.status === 409 && error.message === "Documento ya existe",
    );
  } finally {
    global.fetch = original;
  }
});

test("student reader escapes document content and offers no review or publication controls", () => {
  const { VersionReader } = load(
    "src/components/CourseLibrary/VersionReader.tsx",
  );
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  const detail = {
    id: versionId,
    version: 1,
    status: "PUBLISHED",
    originalName: "guide.pdf",
    format: "pdf",
    sizeBytes: 1234,
    extractionState: "READY",
    extractedText: "<script>alert(1)</script>",
    pages: [],
    contentHash: "a".repeat(64),
    reviewedAt: "2026-10-24",
  };
  const html = renderToStaticMarkup(
    React.createElement(VersionReader, {
      detail,
      canManage: false,
      busy: false,
      downloadUrl: "/private-download",
    }),
  );
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("Descargar original"));
  assert.ok(!html.includes("Publicar versión"));
  assert.ok(!html.includes("Confirmar revisión"));
  assert.ok(!html.includes("<script>"));
});

test("teacher reader prevents publishing unreadable or unreviewed drafts", () => {
  const { VersionReader } = load(
    "src/components/CourseLibrary/VersionReader.tsx",
  );
  const React = nativeRequire("react");
  const { renderToStaticMarkup } = nativeRequire("react-dom/server");
  const base = {
    id: versionId,
    version: 1,
    status: "DRAFT",
    originalName: "guide.pdf",
    format: "pdf",
    sizeBytes: 1234,
    extractionState: "READY",
    extractedText: "Contenido oficial",
    pages: [{ page: 1, text: "Contenido oficial" }],
    contentHash: "a".repeat(64),
    reviewedAt: null,
  };
  const render = (detail) =>
    renderToStaticMarkup(
      React.createElement(VersionReader, {
        detail,
        canManage: true,
        busy: false,
        downloadUrl: "/download",
        onReview() {},
        onPublish() {},
      }),
    );
  assert.ok(render(base).includes("Confirmar revisión"));
  assert.ok(!render(base).includes("Publicar versión"));
  assert.ok(
    render({ ...base, reviewedAt: "2026-10-24" }).includes("Publicar versión"),
  );
  const unreadable = render({
    ...base,
    extractionState: "NEEDS_TEXT",
    extractedText: "",
    pages: [],
  });
  assert.ok(unreadable.includes("Sube una nueva versión"));
  assert.ok(!unreadable.includes("Confirmar revisión"));
  assert.ok(!unreadable.includes("Publicar versión"));
  assert.ok(
    !render({ ...base, status: "ARCHIVED", reviewedAt: "2026-10-24" }).includes(
      "Publicar versión",
    ),
  );
});
