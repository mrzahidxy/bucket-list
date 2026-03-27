import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "@/lib/env";

export type SessionJwtPayload = {
  sub: string;
  email: string;
};

export type PasswordResetJwtPayload = {
  sub: string;
  purpose: "password-reset";
};

const PASSWORD_RESET_EXPIRES_IN: SignOptions["expiresIn"] = "15m";

export const signSessionToken = (payload: SessionJwtPayload): string => {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifySessionToken = (token: string): SessionJwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as SessionJwtPayload;
};

export const signPasswordResetToken = (userId: string): string => {
  return jwt.sign({ sub: userId, purpose: "password-reset" }, env.JWT_SECRET, {
    expiresIn: PASSWORD_RESET_EXPIRES_IN
  });
};

export const verifyPasswordResetToken = (token: string): PasswordResetJwtPayload => {
  const payload = jwt.verify(token, env.JWT_SECRET) as Partial<PasswordResetJwtPayload>;

  if (!payload.sub || payload.purpose !== "password-reset") {
    throw new Error("Invalid password reset token");
  }

  return {
    sub: payload.sub,
    purpose: payload.purpose
  };
};
