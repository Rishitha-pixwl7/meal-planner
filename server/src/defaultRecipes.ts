import type { RecipeInput } from "./validation.js";

// Costs are per serving, in cents.

type Ing = [name: string, quantity: number, unit: string];

const r = (
  name: string,
  cuisine: string,
  cost: number,
  minutes: number,
  meals: RecipeInput["meals"],
  ing: Ing[],
): RecipeInput => ({
  name,
  cuisine,
  costCents: cost,
  minutes,
  meals,
  ingredients: ing.map(([n, quantity, unit]) => ({ name: n, quantity, unit })),
});

export const DEFAULT_RECIPES: RecipeInput[] = [
  // Everyday
  r("Overnight oats", "Everyday", 85, 5, ["breakfast"], [["rolled oats", 0.5, "cup"], ["milk", 0.5, "cup"], ["banana", 1, ""], ["peanut butter", 1, "tbsp"]]),
  r("Eggs on toast", "Everyday", 110, 10, ["breakfast", "lunch"], [["eggs", 2, ""], ["bread", 2, "slice"], ["butter", 1, "tbsp"]]),
  r("Yogurt & granola bowl", "Everyday", 140, 3, ["breakfast"], [["greek yogurt", 1, "cup"], ["granola", 0.33, "cup"], ["frozen berries", 0.5, "cup"]]),
  r("PB&J + apple", "Everyday", 95, 5, ["lunch"], [["bread", 2, "slice"], ["peanut butter", 2, "tbsp"], ["jam", 1, "tbsp"], ["apple", 1, ""]]),
  r("Chicken & hummus wrap", "Everyday", 230, 10, ["lunch"], [["tortillas", 1, ""], ["cooked chicken", 4, "oz"], ["hummus", 2, "tbsp"], ["spinach", 1, "cup"]]),
  r("Upgraded ramen", "Everyday", 120, 8, ["lunch", "dinner"], [["instant ramen", 1, "pack"], ["eggs", 1, ""], ["frozen veggies", 1, "cup"], ["soy sauce", 1, "tbsp"]]),
  r("Black bean rice bowl", "Everyday", 135, 20, ["lunch", "dinner"], [["rice", 0.5, "cup"], ["black beans", 0.5, "can"], ["salsa", 3, "tbsp"], ["cheddar", 1, "oz"]]),
  r("Pasta with tomato sauce", "Everyday", 150, 15, ["dinner"], [["pasta", 4, "oz"], ["pasta sauce", 0.5, "cup"], ["parmesan", 2, "tbsp"]]),
  r("Chicken veggie stir-fry", "Everyday", 280, 20, ["dinner"], [["chicken breast", 6, "oz"], ["frozen veggies", 1.5, "cup"], ["rice", 0.5, "cup"], ["soy sauce", 2, "tbsp"]]),
  r("Bean quesadillas", "Everyday", 160, 12, ["lunch", "dinner"], [["tortillas", 2, ""], ["black beans", 0.33, "can"], ["cheddar", 2, "oz"], ["salsa", 2, "tbsp"]]),

  // Indian
  r("Masala oats", "Indian", 90, 10, ["breakfast"], [["rolled oats", 0.5, "cup"], ["onion", 0.25, ""], ["tomato", 0.5, ""], ["frozen peas", 0.25, "cup"], ["garam masala", 0.5, "tsp"]]),
  r("Poha", "Indian", 80, 15, ["breakfast"], [["poha (flattened rice)", 1, "cup"], ["onion", 0.5, ""], ["peanuts", 2, "tbsp"], ["turmeric", 0.25, "tsp"], ["lemon", 0.5, ""]]),
  r("Masala omelette & toast", "Indian", 120, 10, ["breakfast", "lunch"], [["eggs", 2, ""], ["onion", 0.25, ""], ["tomato", 0.25, ""], ["green chili", 0.5, ""], ["bread", 2, "slice"]]),
  r("Dal tadka with rice", "Indian", 95, 30, ["lunch", "dinner"], [["red lentils", 0.33, "cup"], ["onion", 0.25, ""], ["garlic", 1, "clove"], ["cumin seeds", 0.5, "tsp"], ["turmeric", 0.25, "tsp"], ["rice", 0.5, "cup"]]),
  r("Chana masala with rice", "Indian", 130, 25, ["lunch", "dinner"], [["chickpeas", 0.5, "can"], ["canned tomatoes", 0.33, "can"], ["onion", 0.5, ""], ["garam masala", 1, "tsp"], ["rice", 0.5, "cup"]]),
  r("Rajma chawal", "Indian", 120, 30, ["lunch", "dinner"], [["kidney beans", 0.5, "can"], ["canned tomatoes", 0.33, "can"], ["onion", 0.5, ""], ["garam masala", 1, "tsp"], ["rice", 0.5, "cup"]]),
  r("Vegetable pulao", "Indian", 110, 25, ["lunch", "dinner"], [["rice", 0.5, "cup"], ["frozen veggies", 1, "cup"], ["onion", 0.25, ""], ["cumin seeds", 0.5, "tsp"], ["garam masala", 0.5, "tsp"]]),
  r("Aloo gobi", "Indian", 140, 25, ["dinner"], [["potato", 1, ""], ["frozen cauliflower", 1, "cup"], ["onion", 0.5, ""], ["turmeric", 0.5, "tsp"], ["garam masala", 1, "tsp"], ["roti", 2, ""]]),
  r("Egg curry with rice", "Indian", 150, 25, ["dinner"], [["eggs", 2, ""], ["canned tomatoes", 0.33, "can"], ["onion", 0.5, ""], ["garam masala", 1, "tsp"], ["rice", 0.5, "cup"]]),
  r("Chicken curry with rice", "Indian", 290, 35, ["dinner"], [["chicken thighs", 6, "oz"], ["canned tomatoes", 0.33, "can"], ["onion", 0.5, ""], ["plain yogurt", 0.25, "cup"], ["garam masala", 1, "tsp"], ["rice", 0.5, "cup"]]),

  // Italian
  r("Bruschetta toast", "Italian", 110, 10, ["breakfast", "lunch"], [["bread", 2, "slice"], ["tomato", 1, ""], ["garlic", 1, "clove"], ["fresh basil leaves", 4, ""], ["olive oil", 1, "tbsp"]]),
  r("Spinach frittata", "Italian", 140, 15, ["breakfast", "lunch"], [["eggs", 3, ""], ["spinach", 1, "cup"], ["onion", 0.25, ""], ["parmesan", 2, "tbsp"]]),
  r("Caprese sandwich", "Italian", 210, 5, ["lunch"], [["ciabatta roll", 1, ""], ["fresh mozzarella", 2, "oz"], ["tomato", 1, ""], ["fresh basil leaves", 4, ""], ["olive oil", 1, "tbsp"]]),
  r("Minestrone soup", "Italian", 130, 30, ["lunch", "dinner"], [["frozen veggies", 1, "cup"], ["canned tomatoes", 0.33, "can"], ["cannellini beans", 0.33, "can"], ["small pasta", 1, "oz"], ["onion", 0.25, ""]]),
  r("Pasta e fagioli", "Italian", 140, 25, ["lunch", "dinner"], [["small pasta", 2, "oz"], ["cannellini beans", 0.5, "can"], ["canned tomatoes", 0.33, "can"], ["onion", 0.25, ""], ["garlic", 1, "clove"]]),
  r("Spaghetti aglio e olio", "Italian", 90, 15, ["dinner"], [["spaghetti", 4, "oz"], ["garlic", 3, "clove"], ["olive oil", 2, "tbsp"], ["red pepper flakes", 0.25, "tsp"], ["parmesan", 2, "tbsp"]]),
  r("Penne arrabbiata", "Italian", 120, 20, ["dinner"], [["penne", 4, "oz"], ["canned tomatoes", 0.5, "can"], ["garlic", 2, "clove"], ["red pepper flakes", 0.25, "tsp"], ["olive oil", 1, "tbsp"]]),
  r("Pesto pasta with tomatoes", "Italian", 160, 15, ["lunch", "dinner"], [["pasta", 4, "oz"], ["pesto", 3, "tbsp"], ["cherry tomatoes", 0.5, "cup"], ["parmesan", 1, "tbsp"]]),
  r("Mushroom risotto", "Italian", 200, 35, ["dinner"], [["arborio rice", 0.5, "cup"], ["mushrooms", 4, "oz"], ["onion", 0.25, ""], ["vegetable broth", 2, "cup"], ["parmesan", 2, "tbsp"]]),
  r("Chicken parmesan", "Italian", 320, 35, ["dinner"], [["chicken breast", 6, "oz"], ["breadcrumbs", 0.25, "cup"], ["eggs", 1, ""], ["pasta sauce", 0.5, "cup"], ["mozzarella", 1.5, "oz"]]),
];

export const toCreateData = (recipe: RecipeInput) => ({
  name: recipe.name,
  cuisine: recipe.cuisine,
  costCents: recipe.costCents,
  minutes: recipe.minutes,
  meals: recipe.meals,
  ingredients: { create: recipe.ingredients },
});
