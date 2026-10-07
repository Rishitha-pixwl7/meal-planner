# Dorm Kitchen Planner

A full-stack meal planner for students. Plan a week of cheap meals, track the cost against a weekly budget, and get a grocery list built automatically from your plan.

**Tech stack:** React + TypeScript (Vite) · Node.js + Express · PostgreSQL + Prisma · JWT authentication · Vitest

## Features

- Create an account and log in (passwords hashed with bcrypt, JWT sessions)
- Email verification: sign-up sends a 6-digit code that expires in 15 minutes, with limited attempts and a resend cooldown
- New accounts start with 30 budget-friendly recipes: everyday, Indian and Italian
- Filter recipes by cuisine
- Weekly plan: breakfast, lunch and dinner for each day, with previous/next week navigation
- Weekly budget tracker that shows how much is left or how far over you are
- Grocery list generated on the server by merging every planned meal's ingredients
- Tick off groceries as you shop (saved per week)
- Add, edit and delete your own recipes
- Works on phones

## How it's built

```
Browser (React)  ──fetch /api/...──▶  Express API  ──Prisma──▶  PostgreSQL
   client/                              server/
```

| Folder | What's inside |
|---|---|
| `client/src/components` | React components: `Planner`, `WeekGrid`, `RecipePicker`, `GroceryList`, `BudgetBar`, `RecipesPage`, `RecipeForm`, `AuthPage` |
| `client/src/api.ts` | Every call to the backend |
| `client/src/utils.ts` | Date, money and cost helpers (unit tested) |
| `server/prisma/schema.prisma` | Database tables |
| `server/src/routes` | API endpoints: auth, me, recipes, plan, grocery |
| `server/src/middleware/auth.ts` | Checks the login token on protected routes |
| `server/src/lib/grocery.ts` | Grocery list merging logic (unit tested) |

### API

| Method | Path | What it does |
|---|---|---|
| POST | `/api/auth/register` | Create an account and email a 6-digit code |
| POST | `/api/auth/verify` | Check the code, returns a token |
| POST | `/api/auth/resend-code` | Email a new code (once per 60 seconds) |
| POST | `/api/auth/login` | Log in, returns a token (verified accounts only) |
| GET / PATCH | `/api/me` | Get the current user / update the weekly budget |
| GET / POST | `/api/recipes` | List / create recipes |
| PUT / DELETE | `/api/recipes/:id` | Edit / delete a recipe |
| GET / PUT / DELETE | `/api/plan?week=YYYY-MM-DD` | Get a week's plan / set or clear one meal / clear the week |
| GET / PATCH | `/api/grocery?week=YYYY-MM-DD` | Get the grocery list / tick an item |

All routes except register and login need an `Authorization: Bearer <token>` header. Users can only see and change their own data.

## Running it locally

You need **Node.js 20+** and either **Docker** or a local **PostgreSQL** install.

**1. Start the database**

```bash
docker compose up -d
```

**2. Start the API** (in one terminal)

```bash
cd server
cp .env.example .env      # then put a long random string in JWT_SECRET
npm install
npm run db:migrate        # creates the tables; name the migration "init"
npm run dev               # API on http://localhost:4000
```

**3. Start the website** (in a second terminal)

```bash
cd client
npm install
npm run dev               # open http://localhost:5173
```

Create an account and start planning.

### Email verification

Without email settings, verification codes are printed in the server terminal, so you can develop without an email account. To send real emails, fill in the `SMTP_*` settings in `server/.env` (instructions for Gmail are in `.env.example`) and restart the server.

### Adding new starter recipes to existing accounts

New accounts get every recipe in `server/src/defaultRecipes.ts`. After adding recipes there, run this to give existing accounts the ones they're missing:

```bash
cd server && npm run add-recipes
```

### Tests

```bash
cd server && npm test
cd client && npm test
```

## Deploying

1. **Database + API on Render** (or Railway): create a PostgreSQL database, then a Web Service from the `server` folder.
   - Build command: `npm install && npx prisma generate && npm run build && npm run db:deploy`
   - Start command: `npm start`
   - Environment variables: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN` (your Vercel URL)
2. **Website on Vercel:** import the repo, set the root directory to `client`, and set `VITE_API_URL` to your API's URL.

## Ideas for next features

- "Plan my week under $X": auto-fill the week with the cheapest recipes that fit the budget
- Spending history chart across the semester
- Copy last week's plan
- Share recipes with other students
