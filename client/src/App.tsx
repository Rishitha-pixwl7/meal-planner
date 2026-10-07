import { useEffect, useState } from "react";
import { api, setUnauthorizedHandler, tokenStore } from "./api";
import AuthPage from "./components/AuthPage";
import Planner from "./components/Planner";
import RecipesPage from "./components/RecipesPage";
import type { User } from "./types";

type Tab = "plan" | "recipes";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("plan");

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    if (!tokenStore.get()) {
      setChecking(false);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setChecking(false));
  }, []);

  function logOut() {
    tokenStore.clear();
    setUser(null);
  }

  if (checking) return <p className="center muted">Loading…</p>;
  if (!user) return <AuthPage onAuthed={setUser} />;

  return (
    <div className="wrap">
      <nav className="topbar">
        <span className="brand">Dorm Kitchen</span>
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === "plan"} className={tab === "plan" ? "tab active" : "tab"} onClick={() => setTab("plan")}>
            Week plan
          </button>
          <button role="tab" aria-selected={tab === "recipes"} className={tab === "recipes" ? "tab active" : "tab"} onClick={() => setTab("recipes")}>
            Recipes
          </button>
        </div>
        <div className="account">
          <span className="muted small">{user.email}</span>
          <button className="btn" onClick={logOut}>
            Log out
          </button>
        </div>
      </nav>

      {tab === "plan" ? <Planner user={user} onUserChange={setUser} /> : <RecipesPage />}
    </div>
  );
}
