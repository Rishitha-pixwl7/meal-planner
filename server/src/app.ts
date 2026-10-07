import cors from "cors";
import express from "express";
import { errorHandler } from "./http.js";
import { authRouter } from "./routes/auth.js";
import { groceryRouter } from "./routes/grocery.js";
import { meRouter } from "./routes/me.js";
import { planRouter } from "./routes/plan.js";
import { recipesRouter } from "./routes/recipes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/me", meRouter);
  app.use("/api/recipes", recipesRouter);
  app.use("/api/plan", planRouter);
  app.use("/api/grocery", groceryRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
  app.use(errorHandler);
  return app;
}
