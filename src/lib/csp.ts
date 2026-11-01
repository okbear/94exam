/** Development needs Vite's injected scripts and local WebSocket connection. */
export function contentSecurityPolicy(nonce: string, development: boolean) {
  if (!/^[a-f0-9]{32}$/.test(nonce)) throw new Error("Invalid CSP nonce");
  const scripts = development
    ? "'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com"
    : `'nonce-${nonce}' 'strict-dynamic' 'self'`;
  const connections = development
    ? "'self' ws://localhost:* ws://127.0.0.1:* https://va.vercel-scripts.com"
    : "'self'";
  return [
    "default-src 'self'",
    `script-src ${scripts}`,
    `connect-src ${connections}`,
    // React updates inline style attributes for charts and the draggable calculator.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
  ].join("; ");
}
