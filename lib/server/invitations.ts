import crypto from "node:crypto";

export const createInvitationToken = (): string => {
  return crypto.randomBytes(24).toString("base64url");
};

export const hashInvitationToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const tokenMatchesHash = (token: string, tokenHash: string): boolean => {
  return hashInvitationToken(token) === tokenHash;
};
