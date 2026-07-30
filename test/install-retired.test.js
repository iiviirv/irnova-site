import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { onRequest as retireInstall } from "../functions/install.js";
import { onRequest as retireInstallHtml } from "../functions/install.html.js";

for (const [route, handler] of [
  ["/install", retireInstall],
  ["/install.html", retireInstallHtml],
]) {
  test(`${route} is retired without redirecting`, async () => {
    const response = await handler({
      request: new Request(`https://novaproxy.online${route}`),
    });

    assert.equal(response.status, 410);
    assert.equal(response.headers.get("Location"), null);
    assert.equal(response.headers.get("Cache-Control"), "no-store, max-age=0");
    assert.match(response.headers.get("Content-Security-Policy"), /default-src 'none'/);

    const body = await response.text();
    assert.match(body, /removed for security/i);
    assert.doesNotMatch(body, /type=["']password/i);
    assert.doesNotMatch(body, /api-tokens/i);
  });
}

test("/setup is a credential-free static page", async () => {
  const html = await readFile(new URL("../public/setup/index.html", import.meta.url), "utf8");
  const persianFont = await readFile(
    new URL("../public/fonts/Vazirmatn-arabic.woff2", import.meta.url),
  );

  assert.match(html, /IRNovaProxy_Bot\?start=install/);
  assert.match(html, /IRNovaProxy_Bot\?start=update/);
  assert.match(
    html,
    /https:\/\/deploy\.workers\.cloudflare\.com\/\?url=https:\/\/github\.com\/IRNova\/Nova-Proxy/,
  );
  assert.match(html, /novaproxy\.online\/setup/);
  assert.match(html, /@font-face[\s\S]*Vazirmatn-arabic\.woff2/);
  assert.ok(persianFont.byteLength > 40_000);
  assert.doesNotMatch(html, /<input\b/i);
  assert.doesNotMatch(html, /<form\b/i);
  assert.doesNotMatch(html, /<script\b/i);
  assert.doesNotMatch(html, /navigator\.clipboard|fetch\s*\(/i);
  assert.doesNotMatch(html, /api\.cloudflare\.com/i);
});
