import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { verifySessionToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/models/User";
import type { SafeUser } from "@/types";

export const getSession = async (): Promise<SafeUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = verifySessionToken(token);
    await connectToDatabase();
    const user = await UserModel.findById(decoded.sub).lean();

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null
    };
  } catch {
    return null;
  }
};
