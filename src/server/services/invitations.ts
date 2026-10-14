
import "server-only";

import { randomBytes, createHash } from "node:crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export function generateActivationToken() {
  return randomBytes(32).toString("hex");
}

export function hashActivationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function sendActivationEmail(
  email: string,
  token: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const appUrl = process.env.APP_URL;

  if (!apiKey || !from || !appUrl) {
    throw new Error(
      "Email configuration is missing. Check RESEND_API_KEY, EMAIL_FROM and APP_URL."
    );
  }

  const activationUrl = new URL("/activate", appUrl);
  activationUrl.searchParams.set("token", token);

  const resend = new Resend(apiKey);

  const result = await resend.emails.send({
    from,
    to: email,
    subject: "Activate your ResourceDesk account",
    text: [
      "Welcome to ResourceDesk!",
      "",
      "Your administrator has invited you to join ResourceDesk.",
      "Use the following link to activate your account:",
      "",
      activationUrl.toString(),
      "",
      "This link expires in 24 hours and can be used only once.",
      "If you were not expecting this invitation, ignore this email.",
    ].join("\n"),
  });

  if (result.error) {
    throw new Error(
      result.error.message || "Failed to send invitation email."
    );
  }
}

export async function findValidActivation(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return null;
  }

  return prisma.accountActivationToken.findFirst({
    where: {
      tokenHash: hashActivationToken(token),
      usedAt: null,
      expiresAt: { gt: new Date() },
      user: { status: "INVITED" },
    },
    include: {
      user: {
        include: {
          department: {
            select: { name: true },
          },
        },
      },
    },
  });
}
