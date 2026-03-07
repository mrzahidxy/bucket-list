type InvitationAcceptanceInput = {
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: Date;
  recipientEmail: string;
  userEmail: string;
  tokenValid: boolean;
};

type InvitationAcceptanceResult = { ok: true } | { ok: false; reason: string };

export const validateInvitationAcceptance = (input: InvitationAcceptanceInput): InvitationAcceptanceResult => {
  if (input.status !== "pending") {
    return { ok: false as const, reason: "Invitation is not pending" };
  }

  if (input.expiresAt.getTime() < Date.now()) {
    return { ok: false as const, reason: "Invitation has expired" };
  }

  if (!input.tokenValid) {
    return { ok: false as const, reason: "Invalid invitation token" };
  }

  if (input.recipientEmail.toLowerCase() !== input.userEmail.toLowerCase()) {
    return { ok: false as const, reason: "Invitation recipient mismatch" };
  }

  return { ok: true as const };
};
