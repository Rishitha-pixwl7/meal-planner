import { Router } from "express";
import { z } from "zod";
import { HttpError, parse } from "../http.js";
import { requireAuth, userIdOf } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import { publicUser } from "./auth.js";

export const meRouter = Router();
meRouter.use(requireAuth);

meRouter.get("/", async (_req, res) => {
  const user = await prisma.user.findUnique({ where: { id: userIdOf(res) } });
  if (!user) throw new HttpError(401, "Account not found. Please log in again");
  // tokens issued before email verification was added
  if (!user.emailVerifiedAt) throw new HttpError(401, "Please log in and verify your email");
  res.json(publicUser(user));
});

meRouter.patch("/", async (req, res) => {
  const { budgetCents } = parse(z.object({ budgetCents: z.number().int().min(0).max(1_000_000) }), req.body);
  const user = await prisma.user.update({ where: { id: userIdOf(res) }, data: { budgetCents } });
  res.json(publicUser(user));
});
