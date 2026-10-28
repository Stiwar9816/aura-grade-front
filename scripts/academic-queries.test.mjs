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
const request = (query = "", cookie = "ag_session=opaque-session") =>
  new NextRequest(
    `https://aura.example/api/courses/${id}/academic-queries/activities${query}`,
    { headers: { cookie } },
  );

test("academic BFF rejects absent sessions and injected routes/identity without contacting backend", async () => {
  const { handleAcademicQueries } = load(
    "src/lib/server/academicQueriesProxy.ts",
  );
  const saved = global.fetch;
  let calls = 0;
  global.fetch = async () => {
    calls++;
    return Response.json({});
  };
  try {
    assert.equal(
      (
        await handleAcademicQueries(request("", ""), {
          courseId: id,
          segments: ["activities"],
        })
      ).status,
      401,
    );
    for (const segments of [
      ["..", "users"],
      ["activities", "bad-id", "result"],
      ["activities", id, "delete"],
    ])
      assert.equal(
        (await handleAcademicQueries(request(), { courseId: id, segments }))
          .status,
        400,
      );
    for (const query of [
      "?studentId=another",
      "?upcoming=1",
      "?limit=51",
      "?page=0",
      "?limit=1&limit=2",
    ])
      assert.equal(
        (
          await handleAcademicQueries(request(query), {
            courseId: id,
            segments: ["activities"],
          })
        ).status,
        400,
      );
    assert.equal(calls, 0);
  } finally {
    global.fetch = saved;
  }
});

test("academic BFF forwards only the session and supported filters with no-store", async () => {
  const { handleAcademicQueries } = load(
    "src/lib/server/academicQueriesProxy.ts",
  );
  const saved = global.fetch;
  global.fetch = async (url, init) => {
    assert.match(
      String(url),
      /academic-queries\/activities\?upcoming=true&limit=5$/,
    );
    assert.equal(init.headers.get("authorization"), "Bearer opaque-session");
    assert.equal(init.cache, "no-store");
    return Response.json({ items: [] });
  };
  try {
    const response = await handleAcademicQueries(
      request("?upcoming=true&limit=5"),
      { courseId: id, segments: ["activities"] },
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(await response.json(), { items: [] });
  } finally {
    global.fetch = saved;
  }
});

test("academic BFF clears expired sessions and hides transport failures", async () => {
  const { handleAcademicQueries } = load(
    "src/lib/server/academicQueriesProxy.ts",
  );
  const saved = global.fetch;
  try {
    global.fetch = async () =>
      Response.json({ error: "Expired" }, { status: 401 });
    const response = await handleAcademicQueries(request(), {
      courseId: id,
      segments: ["activities", id, "result"],
    });
    assert.equal(response.status, 401);
    assert.match(response.headers.get("set-cookie"), /ag_session=;/);
    global.fetch = async () => {
      throw new Error("internal secret");
    };
    const failure = await handleAcademicQueries(request(), {
      courseId: id,
      segments: ["activities"],
    });
    assert.equal(failure.status, 503);
    assert.doesNotMatch(await failure.text(), /internal secret/);
  } finally {
    global.fetch = saved;
  }
});
