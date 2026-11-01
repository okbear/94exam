import {
  createIsomorphicFn,
  getGlobalStartContext,
} from "@tanstack/react-start";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
const getSSROptions = createIsomorphicFn().server(() => {
  const context: unknown = getGlobalStartContext();
  if (
    !context ||
    typeof context !== "object" ||
    !("nonce" in context) ||
    typeof context.nonce !== "string"
  )
    throw new Error("CSP nonce is missing");
  return { nonce: context.nonce };
});
export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    ssr: getSSROptions(),
  });
}
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
