import { z } from "zod";

export const signUpAudienceSchema = z.enum(["user", "event-holder"], {
  error: "Choose whether you're signing up as a normal user or an event holder",
});

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .refine((value) => value.trim().length >= 8, {
    message: "Password cannot be only whitespace",
  });

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    audience: signUpAudienceSchema,
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .check((ctx) => {
    if (ctx.value.password !== ctx.value.confirmPassword) {
      ctx.issues.push({
        code: "custom",
        message: "Passwords do not match",
        input: ctx.value.confirmPassword,
        path: ["confirmPassword"],
      });
    }
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password must be at least 8 characters"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .check((ctx) => {
    if (ctx.value.newPassword !== ctx.value.confirmPassword) {
      ctx.issues.push({
        code: "custom",
        message: "Passwords do not match",
        input: ctx.value.confirmPassword,
        path: ["confirmPassword"],
      });
    }
  });

export const verificationEmailRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .check((ctx) => {
    if (ctx.value.newPassword !== ctx.value.confirmPassword) {
      ctx.issues.push({
        code: "custom",
        message: "Passwords do not match",
        input: ctx.value.confirmPassword,
        path: ["confirmPassword"],
      });
    }
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SignUpAudienceInput = z.infer<typeof signUpAudienceSchema>;
export type VerificationEmailRequestInput = z.infer<
  typeof verificationEmailRequestSchema
>;
export type ForgotPasswordRequestInput = z.infer<
  typeof forgotPasswordRequestSchema
>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
