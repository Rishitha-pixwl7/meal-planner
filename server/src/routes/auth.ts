import bcrypt from "bcryptjs";
import { Router } from "express";
import { DEFAULT_RECIPES, toCreateData } from "../defaultRecipes.js";
import { HttpError, parse } from "../http.js";
import { sendVerificationEmail } from "../lib/email.js";
import { CODE_TTL_MS, MAX_ATTEMPTS, codeMatches, cooldownSecondsLeft, generateCode, hashCode } from "../lib/verification.js";
import { jwtSecret, signToken } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import { credentialsSchema, emailOnlySchema, verifySchema } from "../validation.js";

export const authRouter = Router();

const publicUser = (u: { id: number; email: string; budgetCents: number }) => ({
  id: u.id,
  email: u.email,
  budgetCents: u.budgetCents,
});

async function sendNewCode(user: { id: number; email: string; verifyCodeSentAt: Date | null }) {
  if (cooldownSecondsLeft(user.verifyCodeSentAt) > 0) return;

  const code = generateCode();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      verifyCodeHash: hashCode(code, jwtSecret()),
      verifyCodeExpiresAt: new Date(Date.now() + CODE_TTL_MS),
      verifyCodeSentAt: new Date(),
      verifyAttempts: 0,
    },
  });

  try {
    await sendVerificationEmail(user.email, code);
  } catch (err) {
    console.error("Email failed:", err);
    await prisma.user.update({ where: { id: user.id }, data: { verifyCodeSentAt: null } });
    throw new HttpError(502, "We couldn't send the verification email. Please try again in a moment.");
  }
}

authRouter.post("/register", async (req, res) => {
  const { email, password } = parse(credentialsSchema, req.body);
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.emailVerifiedAt) throw new HttpError(409, "An account with this email already exists");

  // an unverified account can be taken over, so nobody can squat on someone else's email
  const user = existing
    ? await prisma.user.update({ where: { id: existing.id }, data: { passwordHash } })
    : await prisma.user.create({
        data: {
          email,
          passwordHash,
          recipes: { create: DEFAULT_RECIPES.map(toCreateData) },
        },
      });

  await sendNewCode(user);
  res.status(201).json({ needsVerification: true, email });
});

authRouter.post("/verify", async (req, res) => {
  const { email, code } = parse(verifySchema, req.body);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new HttpError(400, "That code isn't right");
  if (user.emailVerifiedAt) throw new HttpError(400, "This email is already verified. Please log in.");
  if (!user.verifyCodeHash || !user.verifyCodeExpiresAt || user.verifyCodeExpiresAt < new Date()) {
    throw new HttpError(400, "This code has expired. Send a new code and try again.", "CODE_EXPIRED");
  }
  if (user.verifyAttempts >= MAX_ATTEMPTS) {
    throw new HttpError(429, "Too many wrong tries. Send a new code and try again.", "CODE_EXPIRED");
  }

  if (!codeMatches(code, user.verifyCodeHash, jwtSecret())) {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { verifyAttempts: { increment: 1 } },
    });
    const left = MAX_ATTEMPTS - updated.verifyAttempts;
    throw new HttpError(400, left > 0 ? `That code isn't right. ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many wrong tries. Send a new code.");
  }

  const verified = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      verifyCodeHash: null,
      verifyCodeExpiresAt: null,
      verifyAttempts: 0,
    },
  });
  res.json({ token: signToken(verified.id), user: publicUser(verified) });
});

authRouter.post("/resend-code", async (req, res) => {
  const { email } = parse(emailOnlySchema, req.body);
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && !user.emailVerifiedAt) {
    const wait = cooldownSecondsLeft(user.verifyCodeSentAt);
    if (wait > 0) throw new HttpError(429, `Please wait ${wait} seconds before asking for another code.`);
    await sendNewCode(user);
  }
  // same response either way so this can't be used to check which emails exist
  res.status(204).end();
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = parse(credentialsSchema, req.body);
  const user = await prisma.user.findUnique({ where: { email } });

  // same message for unknown email and wrong password (no account enumeration)
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, "Wrong email or password");
  }

  if (!user.emailVerifiedAt) {
    await sendNewCode(user);
    throw new HttpError(403, `Please verify your email first. We sent a 6-digit code to ${user.email}.`, "EMAIL_NOT_VERIFIED");
  }

  res.json({ token: signToken(user.id), user: publicUser(user) });
});

export { publicUser };
