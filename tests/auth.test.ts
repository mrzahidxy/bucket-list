import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { signSessionToken, verifySessionToken } from "@/lib/auth/jwt";

describe("auth utilities", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("Password123!");

    expect(hash).not.toBe("Password123!");
    await expect(verifyPassword("Password123!", hash)).resolves.toBe(true);
    await expect(verifyPassword("WrongPassword", hash)).resolves.toBe(false);
  });

  it("signs and verifies session JWT", () => {
    const token = signSessionToken({ sub: "user-1", email: "user@example.com" });
    const decoded = verifySessionToken(token);

    expect(decoded.sub).toBe("user-1");
    expect(decoded.email).toBe("user@example.com");
  });
});
