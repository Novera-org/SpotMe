import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import {
  isAuthEmailSendingEnabled,
  sendResetPasswordEmailMessage,
  sendVerificationEmailMessage,
} from "@/lib/email";

const AUTH_BASE_URL =
  process.env.BETTER_AUTH_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  "http://localhost:3000";
const AUTH_EMAIL_SENDING_ENABLED = isAuthEmailSendingEnabled();

export const auth = betterAuth({
  baseURL: AUTH_BASE_URL,
  trustedOrigins: [AUTH_BASE_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 8,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    ...(AUTH_EMAIL_SENDING_ENABLED
      ? {
          sendResetPassword: async ({ user, url }: { user: { email: string; name?: string | null }; url: string }) => {
            await sendResetPasswordEmailMessage({
              to: user.email,
              name: user.name,
              url,
            });
          },
        }
      : {}),
  },
  emailVerification: {
    expiresIn: 60 * 60 * 24,
    sendOnSignUp: AUTH_EMAIL_SENDING_ENABLED,
    sendOnSignIn: false,
    autoSignInAfterVerification: false,
    ...(AUTH_EMAIL_SENDING_ENABLED
      ? {
          sendVerificationEmail: async ({ user, url }: { user: { email: string; name?: string | null }; url: string }) => {
            await sendVerificationEmailMessage({
              to: user.email,
              name: user.name,
              url,
            });
          },
        }
      : {}),
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        required: false,
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    database: {
      generateId: "uuid", // match uuid columns in schema
    },
  },
  plugins: [nextCookies()], // must be the last plugin
});

export type Session = typeof auth.$Infer.Session;
