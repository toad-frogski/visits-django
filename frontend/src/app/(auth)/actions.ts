"use server";

import { TokenApi, TokenObtainPair } from "@/lib/api";
import { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { jwtVerify } from "jose";

const api = new TokenApi();

const secret = new TextEncoder().encode(process.env.APP_SECRET ?? "");

const SignupFormSchema = z.object({
  username: z.string().min(1, "Username is required").trim(),
  password: z.string().min(1, "Password is required").trim(),
});

type SignupFormState =
  | {
      errors?: {
        username?: string[];
        password?: string[];
        common?: string[];
      };
    }
  | undefined;

export async function signup(_: SignupFormState, formData: FormData) {
  const result = SignupFormSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!result.success) {
    const tree = z.treeifyError(result.error);

    return {
      errors: { username: tree.properties?.username?.errors, password: tree.properties?.password?.errors },
    };
  }

  try {
    const { username, password } = result.data;
    await api.tokenCreate({ username: username, password: password } as unknown as TokenObtainPair, {
      withCredentials: true,
    });
  } catch (e) {
    let message = "Something went wrong";
    if (isAxiosError(e) && e.response?.status === 401) {
      message = "Invalid username or password";
    }
    return { errors: { common: [message] } };
  }

  redirect("/");
}

export async function refresh() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  await api.tokenRefreshCreate({ refresh: refreshToken } as unknown as TokenObtainPair, { withCredentials: true });
}

export async function getUser(): Promise<number | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) return null;

  try {
    const { payload } = await jwtVerify(accessToken, secret);
    return payload.user_id as number;
  } catch {
    return null;
  }
}
