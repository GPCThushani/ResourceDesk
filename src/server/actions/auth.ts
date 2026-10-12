
"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export type LoginState = {
  error: string | null;
};

export async function authenticate(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });

    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Invalid email or password, or your account is inactive.",
      };
    }

    // Allow Next.js to handle successful login redirects.
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
