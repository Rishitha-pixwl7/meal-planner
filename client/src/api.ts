import type { GroceryItem, Meal, PlanEntry, Recipe, RecipeInput, User } from "./types";

const BASE = import.meta.env.VITE_API_URL ?? "";
const TOKEN_KEY = "meal-planner-token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (fn: () => void) => (onUnauthorized = fn);

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && token) {
    tokenStore.clear();
    onUnauthorized();
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error ?? `Request failed (${res.status})`, body.code);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

export const api = {
  register: (email: string, password: string) =>
    request<{ needsVerification: true; email: string }>("/api/auth/register", json("POST", { email, password })),
  verify: (email: string, code: string) =>
    request<{ token: string; user: User }>("/api/auth/verify", json("POST", { email, code })),
  resendCode: (email: string) => request<void>("/api/auth/resend-code", json("POST", { email })),
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/api/auth/login", json("POST", { email, password })),

  me: () => request<User>("/api/me"),
  setBudget: (budgetCents: number) => request<User>("/api/me", json("PATCH", { budgetCents })),

  recipes: {
    list: () => request<Recipe[]>("/api/recipes"),
    create: (r: RecipeInput) => request<Recipe>("/api/recipes", json("POST", r)),
    update: (id: number, r: RecipeInput) => request<Recipe>(`/api/recipes/${id}`, json("PUT", r)),
    remove: (id: number) => request<void>(`/api/recipes/${id}`, { method: "DELETE" }),
  },

  plan: {
    get: (week: string) => request<PlanEntry[]>(`/api/plan?week=${week}`),
    set: (week: string, day: number, meal: Meal, recipeId: number | null) =>
      request<PlanEntry | undefined>("/api/plan", json("PUT", { week, day, meal, recipeId })),
    clear: (week: string) => request<void>(`/api/plan?week=${week}`, { method: "DELETE" }),
  },

  grocery: {
    get: (week: string) => request<GroceryItem[]>(`/api/grocery?week=${week}`),
    toggle: (week: string, itemKey: string, checked: boolean) =>
      request<void>("/api/grocery", json("PATCH", { week, itemKey, checked })),
  },
};
