const BODY = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Installer retired</title>
</head>
<body>
  <main>
    <h1>This installer has been retired</h1>
    <p>The previous installer was removed for security. It no longer accepts Cloudflare credentials or API tokens.</p>
    <p>Return to the <a href="/">Nova Proxy home page</a> and use the current official setup instructions.</p>
  </main>
</body>
</html>`;

const HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "text/html; charset=utf-8",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

export function retiredInstaller() {
  return new Response(BODY, { status: 410, headers: HEADERS });
}

export function onRequest() {
  return retiredInstaller();
}
