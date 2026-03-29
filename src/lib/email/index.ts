import { processLogger } from "@/lib/logger";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME?.trim() || "SpotMe";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type VerificationEmailInput = {
  to: string;
  name: string | null | undefined;
  url: string;
};

type ResetPasswordEmailInput = {
  to: string;
  name: string | null | undefined;
  url: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getRecipientName(name: string | null | undefined) {
  const trimmed = name?.trim();
  if (trimmed) {
    return trimmed;
  }

  return "there";
}

function buildEmailLayout(input: {
  preheader: string;
  title: string;
  intro: string;
  ctaLabel: string;
  ctaUrl: string;
  footer: string;
}) {
  const escapedTitle = escapeHtml(input.title);
  const escapedIntro = escapeHtml(input.intro);
  const escapedFooter = escapeHtml(input.footer);
  const escapedPreheader = escapeHtml(input.preheader);
  const escapedLabel = escapeHtml(input.ctaLabel);
  const escapedUrl = escapeHtml(input.ctaUrl);

  const html = `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#0f1115;color:#f3f4f6;font-family:Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapedPreheader}</div>
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <div style="border:1px solid #2a2f3a;background:#171a21;padding:32px;">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#93c5fd;">${escapeHtml(APP_NAME)}</p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#ffffff;">${escapedTitle}</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#d1d5db;">${escapedIntro}</p>
        <p style="margin:0 0 28px;">
          <a href="${escapedUrl}" style="display:inline-block;padding:12px 18px;background:#f59e0b;color:#111827;text-decoration:none;font-weight:700;">
            ${escapedLabel}
          </a>
        </p>
        <p style="margin:0 0 12px;font-size:13px;line-height:1.7;color:#9ca3af;">
          If the button does not work, copy and paste this link into your browser:
        </p>
        <p style="margin:0 0 24px;word-break:break-word;font-size:13px;line-height:1.7;color:#93c5fd;">
          <a href="${escapedUrl}" style="color:#93c5fd;">${escapedUrl}</a>
        </p>
        <p style="margin:0;font-size:13px;line-height:1.7;color:#9ca3af;">${escapedFooter}</p>
      </div>
    </div>
  </body>
</html>`;

  const text = `${input.title}

${input.intro}

${input.ctaLabel}: ${input.ctaUrl}

${input.footer}`;

  return { html, text };
}

async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  const fromName = process.env.AUTH_EMAIL_FROM_NAME?.trim() || APP_NAME;
  const fromAddress = process.env.AUTH_EMAIL_FROM_ADDRESS?.trim();
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpPort = process.env.SMTP_PORT?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_PASSWORD?.trim();
  const smtpConfigured = Boolean(
    smtpHost && smtpPort && smtpUser && smtpPassword && fromAddress,
  );

  if (!smtpConfigured) {
    if (process.env.NODE_ENV !== "production") {
      processLogger.info("[email] Using development email fallback.", {
        to,
        subject,
        text,
      });
      return;
    }

    throw new Error("Auth email delivery is not configured.");
  }

  /**
   * SMTP transport is intentionally deferred to the next auth phase.
   * Plan 0 keeps the email layer provider-agnostic and preserves the
   * development fallback so the rest of the auth wiring can be built safely.
   */
  if (process.env.NODE_ENV === "production") {
    throw new Error("SMTP delivery is configured but not implemented yet.");
  }

  processLogger.info(
    "[email] SMTP configuration detected but live SMTP sending is not enabled yet.",
    {
      to,
      subject,
      from: `${fromName} <${fromAddress}>`,
      smtpHost,
      smtpPort,
    },
  );
  processLogger.info("[email] Falling back to local email preview output.", {
    to,
    subject,
    text,
    html,
  });
}

export async function sendVerificationEmailMessage({
  to,
  name,
  url,
}: VerificationEmailInput) {
  const recipient = getRecipientName(name);
  const subject = `Verify your ${APP_NAME} email`;
  const message = buildEmailLayout({
    preheader: "Verify your email to finish setting up your account.",
    title: "Verify your email",
    intro: `Hi ${recipient}, please verify your email to finish setting up your ${APP_NAME} account.`,
    ctaLabel: "Verify email",
    ctaUrl: url,
    footer: "This verification link will expire in 24 hours. If you did not create this account, you can ignore this email.",
  });

  await sendEmail({
    to,
    subject,
    html: message.html,
    text: message.text,
  });
}

export async function sendResetPasswordEmailMessage({
  to,
  name,
  url,
}: ResetPasswordEmailInput) {
  const recipient = getRecipientName(name);
  const subject = `Reset your ${APP_NAME} password`;
  const message = buildEmailLayout({
    preheader: "Use this link to choose a new password.",
    title: "Reset your password",
    intro: `Hi ${recipient}, we received a request to reset your ${APP_NAME} password. Use the link below to choose a new one.`,
    ctaLabel: "Reset password",
    ctaUrl: url,
    footer: "This reset link will expire in 1 hour. If you did not request it, you can ignore this email.",
  });

  await sendEmail({
    to,
    subject,
    html: message.html,
    text: message.text,
  });
}
