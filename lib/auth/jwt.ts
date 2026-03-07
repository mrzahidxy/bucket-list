import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "@/lib/env";

export type SessionJwtPayload = {
  sub: string;
  email: string;
};

export const signSessionToken = (payload: SessionJwtPayload): string => {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifySessionToken = (token: string): SessionJwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as SessionJwtPayload;
};
