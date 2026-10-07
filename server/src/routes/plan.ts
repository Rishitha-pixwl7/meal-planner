import { Router } from "express";
import { z } from "zod";
import { HttpError, parse } from "../http.js";
import { requireAuth, userIdOf } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import { mealSchema, weekSchema } from "../validation.js";

export const planRouter = Router();
planRouter.use(requireAuth);

planRouter.get("/", async (req, res) => {
  const { week } = parse(z.object({ week: weekSchema }), req.query);
  const entries = await prisma.planEntry.findMany({
    where: { userId: userIdOf(res), weekStart: week },
    select: { day: true, meal: true, recipeId: true },
  });
  res.json(entries);
});

// recipeId: null clears the slot
planRouter.put("/", async (req, res) => {
  const userId = userIdOf(res);
  const { week, day, meal, recipeId } = parse(
    z.object({
      week: weekSchema,
      day: z.number().int().min(0).max(6),
      meal: mealSchema,
      recipeId: z.number().int().nullable(),
    }),
    req.body,
  );

  if (recipeId === null) {
    await prisma.planEntry.deleteMany({ where: { userId, weekStart: week, day, meal } });
    res.status(204).end();
    return;
  }

  const recipe = await prisma.recipe.findFirst({ where: { id: recipeId, userId } });
  if (!recipe) throw new HttpError(404, "Recipe not found");

  const entry = await prisma.planEntry.upsert({
    where: { userId_weekStart_day_meal: { userId, weekStart: week, day, meal } },
    create: { userId, weekStart: week, day, meal, recipeId },
    update: { recipeId },
    select: { day: true, meal: true, recipeId: true },
  });
  res.json(entry);
});

planRouter.delete("/", async (req, res) => {
  const userId = userIdOf(res);
  const { week } = parse(z.object({ week: weekSchema }), req.query);
  await prisma.$transaction([
    prisma.planEntry.deleteMany({ where: { userId, weekStart: week } }),
    prisma.groceryCheck.deleteMany({ where: { userId, weekStart: week } }),
  ]);
  res.status(204).end();
});
