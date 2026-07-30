import test from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/cf.js";

function relay(target, init = {}) {
  return new Request(
    `https://novaproxy.online/cf?url=${encodeURIComponent(target)}`,
    init,
  );
}

test("relay blocks arbitrary and over-broad targets", async () => {
  assert.equal((await onRequest({
    request: relay("https://example.com/"),
  })).status, 403);
  assert.equal((await onRequest({
    request: relay("https://other.workers.dev/admin"),
  })).status, 403);
  assert.equal((await onRequest({
    request: relay("https://api.cloudflare.com/client/v4/zones"),
  })).status, 403);
});

test("relay strips auth from source downloads and disables redirects", async () => {
  const originalFetch = globalThis.fetch;
  let observed;
  globalThis.fetch = async (url, init) => {
    observed = { url: String(url), init };
    return new Response("worker source");
  };
  try {
    const response = await onRequest({
      request: relay(
        "https://raw.githubusercontent.com/IRNova/Nova-Proxy/main/worker.js",
        { headers: { Authorization: "Bearer must-not-leak" } },
      ),
    });
    assert.equal(response.status, 200);
    assert.equal(observed.init.headers.has("Authorization"), false);
    assert.equal(observed.init.redirect, "manual");
    assert.equal(response.headers.get("Cache-Control"), "no-store");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("relay forwards auth only to an allowed Cloudflare API route", async () => {
  const originalFetch = globalThis.fetch;
  let observed;
  globalThis.fetch = async (url, init) => {
    observed = { url: String(url), init };
    return new Response(JSON.stringify({ success: true }));
  };
  try {
    const response = await onRequest({
      request: relay(
        "https://api.cloudflare.com/client/v4/user/tokens/verify",
        { headers: { Authorization: "Bearer one-time-token" } },
      ),
    });
    assert.equal(response.status, 200);
    assert.equal(observed.init.headers.get("Authorization"), "Bearer one-time-token");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
