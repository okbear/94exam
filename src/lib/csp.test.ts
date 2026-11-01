import { describe, expect, it } from "vitest";
import { contentSecurityPolicy } from "./csp";
const nonce = "0123456789abcdef0123456789abcdef";
describe("Content Security Policy", () => {
  it("requires a nonce for scripts in production and restricts network destinations", () => {
    const policy = contentSecurityPolicy(nonce, false);
    const scripts = policy
      .split("; ")
      .find((d) => d.startsWith("script-src "))!;
    expect(scripts).toContain(`'nonce-${nonce}'`);
    expect(scripts).toContain("'strict-dynamic'");
    expect(scripts).not.toContain("'unsafe-inline'");
    expect(scripts).not.toContain("'unsafe-eval'");
    expect(policy.split("; ")).toContain("connect-src 'self'");
    expect(policy).not.toContain("localhost");
  });
  it("rejects unsafe nonce values", () => {
    expect(() => contentSecurityPolicy("x'; script-src *", false)).toThrow();
  });
});
