// Adds missing starter recipes to existing accounts. Matched by name, so it's safe to re-run.
import "dotenv/config";
import { DEFAULT_RECIPES, toCreateData } from "../defaultRecipes.js";
import { prisma } from "../prisma.js";

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true } });

  for (const user of users) {
    const existing = await prisma.recipe.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, cuisine: true },
    });
    const byName = new Map(existing.map((r) => [r.name.toLowerCase(), r]));

    let added = 0;
    for (const recipe of DEFAULT_RECIPES) {
      const match = byName.get(recipe.name.toLowerCase());
      if (!match) {
        await prisma.recipe.create({ data: { ...toCreateData(recipe), userId: user.id } });
        added++;
      } else if (!match.cuisine) {
        // created before the cuisine column existed
        await prisma.recipe.update({ where: { id: match.id }, data: { cuisine: recipe.cuisine } });
      }
    }
    console.log(`${user.email}: added ${added} recipe${added === 1 ? "" : "s"}`);
  }

  console.log(users.length ? "Done." : "No accounts yet. New accounts get all recipes automatically.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
