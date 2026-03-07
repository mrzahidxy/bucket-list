import { describe, expect, it } from "vitest";
import { createInvitationToken, hashInvitationToken, tokenMatchesHash } from "@/lib/server/invitations";
import { validateInvitationAcceptance } from "@/lib/server/invitation-acceptance";

describe("invitation acceptance", () => {
  it("hashes and validates invitation token", () => {
    const token = createInvitationToken();
    const tokenHash = hashInvitationToken(token);

    expect(tokenMatchesHash(token, tokenHash)).toBe(true);
    expect(tokenMatchesHash("bad-token", tokenHash)).toBe(false);
  });

  it("accepts valid invitation data", () => {
    const result = validateInvitationAcceptance({
      status: "pending",
      expiresAt: new Date(Date.now() + 1000 * 60),
      recipientEmail: "invitee@example.com",
      userEmail: "invitee@example.com",
      tokenValid: true
    });

    expect(result).toEqual({ ok: true });
  });

  it("rejects expired or mismatched invitations", () => {
    const expired = validateInvitationAcceptance({
      status: "pending",
      expiresAt: new Date(Date.now() - 1000),
      recipientEmail: "invitee@example.com",
      userEmail: "invitee@example.com",
      tokenValid: true
    });

    const mismatch = validateInvitationAcceptance({
      status: "pending",
      expiresAt: new Date(Date.now() + 1000),
      recipientEmail: "a@example.com",
      userEmail: "b@example.com",
      tokenValid: true
    });

    expect(expired.ok).toBe(false);
    expect(mismatch.ok).toBe(false);
  });
});
