import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import ts from "typescript";
const require = createRequire(import.meta.url);
const cache = new Map();
function load(file) {
  const full = path.resolve(file);
  if (cache.has(full)) return cache.get(full).exports;
  const code = ts.transpileModule(
    readFileSync(full, "utf8").replace(/import "server-only";/g, ""),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    },
  ).outputText;
  const mod = { exports: {} };
  cache.set(full, mod);
  new Function("require", "module", "exports", code)(
    (id) =>
      id.startsWith(".")
        ? load(path.resolve(path.dirname(full), id + ".ts"))
        : require(id),
    mod,
    mod.exports,
  );
  return mod.exports;
}
const id = "00000000-0000-4000-8000-000000000001";
const { NextRequest } = require("next/server");
function req(
  method = "POST",
  body = { question: "¿Qué pide la guía?" },
  headers = {},
) {
  return new NextRequest(
    `https://aura.example/api/courses/${id}/assistant/questions`,
    {
      method,
      headers: {
        cookie: "ag_session=opaque-session",
        origin: "https://aura.example",
        "content-type": "application/json",
        ...headers,
      },
      ...(method === "POST" ? { body: JSON.stringify(body) } : {}),
    },
  );
}
const params = { courseId: id, segments: ["questions"] };
test("assistant BFF denies unauthenticated, cross-origin, invalid route/body and excessive requests before backend", async () => {
  const { handleCourseAssistant } = load(
    "src/lib/server/courseAssistantProxy.ts",
  );
  const saved = global.fetch;
  let calls = 0;
  global.fetch = async () => {
    calls++;
    return Response.json({});
  };
  try {
    assert.equal(
      (await handleCourseAssistant(req("POST", {}, { cookie: "" }), params))
        .status,
      401,
    );
    assert.equal(
      (
        await handleCourseAssistant(
          req("POST", {}, { origin: "https://evil.example" }),
          params,
        )
      ).status,
      403,
    );
    for (const body of [
      { question: "x" },
      { question: "x".repeat(1001) },
      { question: "Hola", studentId: id },
      [],
    ])
      assert.equal(
        (await handleCourseAssistant(req("POST", body), params)).status,
        400,
      );
    assert.equal(
      (
        await handleCourseAssistant(req(), {
          courseId: id,
          segments: ["..", "users"],
        })
      ).status,
      400,
    );
    assert.equal((await handleCourseAssistant(req("GET"), params)).status, 405);
    assert.equal(
      (
        await handleCourseAssistant(
          req("POST", { question: "x".repeat(20000) }),
          params,
        )
      ).status,
      413,
    );
    assert.equal(calls, 0);
  } finally {
    global.fetch = saved;
  }
});
test("assistant BFF forwards minimal payload and opaque session, preserves 429/no-store", async () => {
  const { handleCourseAssistant } = load(
    "src/lib/server/courseAssistantProxy.ts",
  );
  const saved = global.fetch;
  global.fetch = async (url, init) => {
    assert.match(String(url), /assistant\/questions$/);
    assert.equal(init.headers.get("authorization"), "Bearer opaque-session");
    assert.deepEqual(JSON.parse(init.body), { question: "¿Qué pide la guía?" });
    return Response.json({ message: "Límite diario" }, { status: 429 });
  };
  try {
    const response = await handleCourseAssistant(req(), params);
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("cache-control"), "no-store");
  } finally {
    global.fetch = saved;
  }
});
test("assistant BFF supports teacher status and bounded batch path, masks failures", async () => {
  const { handleCourseAssistant } = load(
    "src/lib/server/courseAssistantProxy.ts",
  );
  const saved = global.fetch;
  try {
    global.fetch = async () => Response.json({ items: [] });
    assert.equal(
      (
        await handleCourseAssistant(req("GET"), {
          courseId: id,
          segments: ["sources"],
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await handleCourseAssistant(req("POST", {}), {
          courseId: id,
          segments: ["sources", id, "prepare"],
        })
      ).status,
      200,
    );
    global.fetch = async () => {
      throw new Error("secret-key");
    };
    const failed = await handleCourseAssistant(req(), params);
    assert.equal(failed.status, 503);
    assert.doesNotMatch(await failed.text(), /secret-key/);
  } finally {
    global.fetch = saved;
  }
});
