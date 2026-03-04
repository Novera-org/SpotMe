import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Only export session-reading utilities from the client.
// All mutations (signIn, signUp, signOut) use server actions instead.
export const { useSession } = authClient;
