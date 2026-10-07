import { Router } from "express";
import { HttpError, parse } from "../http.js";
import { requireAuth, userIdOf } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import { recipeSchema } from "../validation.js";

export const recipesRouter = Router();
recipesRouter.use(requireAuth);

const withIngredients = { ingredients: { select: { name: true, quantity: true, unit: true }, orderBy: { id: "asc" as const } } };

async function findOwnRecipe(id: number, userId: number) {
  const recipe = await prisma.recipe.findFirst({ where: { id, userId } });
  // 404 rather than 403 so other users' ids can't be probed
  if (!recipe) throw new HttpError(404, "Recipe not found");
  return recipe;
}

recipesRouter.get("/", async (_req, res) => {
  const recipes = await prisma.recipe.findMany({
    where: { userId: userIdOf(res) },
    include: withIngredients,
    orderBy: { name: "asc" },
  });
  res.json(recipes.map(({ userId, createdAt, ...r }) => r));
});

recipesRouter.post("/", async (req, res) => {
  const input = parse(recipeSchema, req.body);
  const recipe = await prisma.recipe.create({
    data: { ...input, userId: userIdOf(res), ingredients: { create: input.ingredients } },
    include: withIngredients,
  });
  const { userId, createdAt, ...rest } = recipe;
  res.status(201).json(rest);
});

recipesRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await findOwnRecipe(id, userIdOf(res));
  const input = parse(recipeSchema, req.body);

  const recipe = await prisma.$transaction(async (tx) => {
    await tx.ingredient.deleteMany({ where: { recipeId: id } });
    return tx.recipe.update({
      where: { id },
      data: { ...input, ingredients: { create: input.ingredients } },
      include: withIngredients,
    });
  });
  const { userId, createdAt, ...rest } = recipe;
  res.json(rest);
});

// cascades to plan entries
recipesRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await findOwnRecipe(id, userIdOf(res));
  await prisma.recipe.delete({ where: { id } });
  res.status(204).end();
});
