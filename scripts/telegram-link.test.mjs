import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("BFF routes proxy only the three link operations through the session", () => {
  const link = read("src/app/api/telegram/link/route.ts");
  const token = read("src/app/api/telegram/link/token/route.ts");
  assert.match(link, /proxyAuthenticatedRest\(request, "telegram\/link", \{ method: "GET" \}\)/);
  assert.match(link, /proxyAuthenticatedRest\(request, "telegram\/link", \{ method: "DELETE" \}\)/);
  assert.match(token, /proxyAuthenticatedRest\(request, "telegram\/link\/token", \{ method: "POST" \}\)/);
  // The browser never supplies identity: no user id, query string or dynamic segment.
  for (const source of [link, token]) assert.doesNotMatch(source, /searchParams|params|userId/);
});

test("component keeps the one-use code out of storage and talks only to the BFF", () => {
  const source = read("src/components/Telegram/TelegramLink.tsx");
  assert.doesNotMatch(source, /localStorage|sessionStorage|document\.cookie/);
  assert.doesNotMatch(source, /console\./);
  assert.match(source, /rel="noopener noreferrer"/);
  for (const [, url] of source.matchAll(/fetch\(([^,)]+)/g)) assert.match(url, /BASE|`\$\{BASE\}\/token`/);
});

test("settings shows the card to students only", () => {
  const source = read("src/pages/settings.tsx");
  assert.match(source, /user\?\.role === UserRole\.STUDENT && <TelegramLink \/>/);
});
