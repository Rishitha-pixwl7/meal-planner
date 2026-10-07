import { useEffect, useState, type FormEvent } from "react";
import { ApiError, api, tokenStore } from "../api";
import type { User } from "../types";

type Mode = "login" | "register" | "verify";

export default function AuthPage({ onAuthed }: { onAuthed: (u: User) => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function goToVerify(message: string) {
    setMode("verify");
    setInfo(message);
    setError("");
    setCode("");
    setCooldown(60);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setInfo("");
  }

  async function submitCredentials(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "register") {
        const res = await api.register(email, password);
        goToVerify(`We sent a 6-digit code to ${res.email}. Enter it below to finish creating your account.`);
      } else {
        const { token, user } = await api.login(email, password);
        tokenStore.set(token);
        onAuthed(user);
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED") goToVerify(err.message);
      else setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { token, user } = await api.verify(email, code);
      tokenStore.set(token);
      onAuthed(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      if (err instanceof ApiError && err.code === "CODE_EXPIRED") setCode("");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError("");
    try {
      await api.resendCode(email);
      setInfo(`We sent a new code to ${email}.`);
      setCode("");
      setCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send a new code");
    }
  }

  if (mode === "verify") {
    return (
      <main className="auth">
        <div className="auth-card">
          <p className="label">Dorm Kitchen · Step 2 of 2</p>
          <h1>Check your email</h1>
          {info && <p className="muted">{info}</p>}

          <form onSubmit={submitCode} className="stack">
            <label htmlFor="code">
              Verification code
              <input
                id="code"
                className="code-input"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button className="btn primary" disabled={busy || code.length !== 6}>
              {busy ? "Checking…" : "Verify email"}
            </button>
          </form>

          <p className="small">
            Didn't get it? Check your spam folder, or{" "}
            {cooldown > 0 ? (
              <span className="muted">send a new code in {cooldown}s</span>
            ) : (
              <button className="link" onClick={resend}>
                send a new code
              </button>
            )}
            .
          </p>
          {import.meta.env.DEV && (
            <p className="hint dev-hint">Running on your computer without email set up? The code is printed in the server terminal.</p>
          )}
          <p className="small">
            <button className="link" onClick={() => switchMode("login")}>
              Back to log in
            </button>
          </p>
        </div>
      </main>
    );
  }

  const isLogin = mode === "login";

  return (
    <main className="auth">
      <div className="auth-card">
        <p className="label">{isLogin ? "Dorm Kitchen" : "Dorm Kitchen · Step 1 of 2"}</p>
        <h1>{isLogin ? "Welcome back" : "Plan cheap meals for the week"}</h1>
        <p className="muted">
          {isLogin ? "Log in to see your meal plan and grocery list." : "New accounts start with 30 budget-friendly recipes. We'll email you a code to confirm your address."}
        </p>

        <form onSubmit={submitCredentials} className="stack">
          <label htmlFor="email">
            Email
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label htmlFor="password">
            Password
            <input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {!isLogin && <span className="hint">At least 8 characters</span>}
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn primary" disabled={busy}>
            {busy ? "Please wait…" : isLogin ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="small">
          {isLogin ? "New here? " : "Already have an account? "}
          <button className="link" onClick={() => switchMode(isLogin ? "register" : "login")}>
            {isLogin ? "Create an account" : "Log in"}
          </button>
        </p>
      </div>
    </main>
  );
}
