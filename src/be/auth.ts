import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/shared/auth-constants";
import { getUserBySessionToken, User } from "./services";

export async function getAuthUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return getUserBySessionToken(token);
}
