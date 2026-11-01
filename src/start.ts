import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { contentSecurityPolicy } from "./lib/csp";

const cspMiddleware = createMiddleware().server(({ next }) => {
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  setResponseHeader(
    "Content-Security-Policy",
    contentSecurityPolicy(nonce, import.meta.env.DEV),
  );
  setResponseHeader("Cache-Control", "private, no-store");
  return next({ context: { nonce } });
});
// Defining a custom Start instance replaces the framework's default CSRF middleware.
const csrfMiddleware = createCsrfMiddleware({
  filter: ({ handlerType }) => handlerType === "serverFn",
});
export const startInstance = createStart(() => ({
  requestMiddleware: [cspMiddleware, csrfMiddleware],
}));
