import { Router } from "express";
import { z } from "zod";
import { parse } from "../http.js";
import { mergeIngredients } from "../lib/grocery.js";
import { requireAuth, userIdOf } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import { weekSchema } from "../validation.js";

export const groceryRouter = Router();
groceryRouter.use(requireAuth);

groceryRouter.get("/", async (req, res) => {
  const userId = userIdOf(res);
  const { week } = parse(z.object({ week: weekSchema }), req.query);

  const [entries, checks] = await Promise.all([
    prisma.planEntry.findMany({
      where: { userId, weekStart: week },
      include: { recipe: { include: { ingredients: true } } },
    }),
    prisma.groceryCheck.findMany({ where: { userId, weekStart: week, checked: true } }),
  ]);

  const checked = new Set(checks.map((c) => c.itemKey));
  const items = mergeIngredients(entries.map((e) => e.recipe.ingredients));
  res.json(items.map((item) => ({ ...item, checked: checked.has(item.key) })));
});

groceryRouter.patch("/", async (req, res) => {
  const userId = userIdOf(res);
  const { week, itemKey, checked } = parse(
    z.object({ week: weekSchema, itemKey: z.string().min(1).max(200), checked: z.boolean() }),
    req.body,
  );
  await prisma.groceryCheck.upsert({
    where: { userId_weekStart_itemKey: { userId, weekStart: week, itemKey } },
    create: { userId, weekStart: week, itemKey, checked },
    update: { checked },
  });
  res.status(204).end();
});
