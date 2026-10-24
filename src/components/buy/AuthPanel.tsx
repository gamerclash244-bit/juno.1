import { useState } from "react";
import { api } from "../../lib/api";

type Mode = "signin" | "signup";

/** Sign in / create account. Used on the Buy page (the gate before paying) and on Orders. */
function AuthPanel({ intro }: { intro?: string }): React.ReactElement {
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (mode === "signup" && name.trim().length < 2) return setError("Enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Use a password with at least 8 characters.");
    setBusy(true);
    try {
      if (mode === "signup") {
        const r = await api.signUp(email, password, name);
        if (r.needsConfirmation) {
          setNotice("Account created. Open the confirmation link we emailed you, then sign in here.");
          setMode("signin");
        }
      } else {
        await api.signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const tab = (m: Mode, label: string): React.ReactElement => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === m}
      onClick={() => {
        setMode(m);
        setError("");
      }}
      className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
        mode === m ? "bg-cap text-black" : "text-gray-100 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 sm:p-9">
      <h2 className="font-display text-2xl font-medium tracking-tight">
        {mode === "signup" ? "Create your account" : "Sign in"}
      </h2>
      <p className="mt-2 max-w-[46ch] text-gray-100">
        {intro ?? "Your account lets you pay securely and track your order with its order ID."}
      </p>

      <div role="tablist" aria-label="Account" className="mt-6 flex gap-1 rounded-full border border-white/15 p-1">
        {tab("signup", "New customer")}
        {tab("signin", "I have an account")}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
        {mode === "signup" && (
          <div>
            <label htmlFor="auth-name" className="field-label">Full name</label>
            <input id="auth-name" className="field-input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <div>
          <label htmlFor="auth-email" className="field-label">Email</label>
          <input id="auth-email" type="email" className="field-input" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="auth-pass" className="field-label">Password</label>
          <input
            id="auth-pass"
            type="password"
            className="field-input"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "signup" && <p className="mt-1.5 text-sm text-gray">At least 8 characters.</p>}
        </div>

        <p role="alert" className="field-error min-h-[1.25rem]">{error}</p>
        {notice && <p role="status" className="rounded-2xl border border-cap/40 bg-cap/10 px-4 py-3 text-cap">{notice}</p>}

        <button type="submit" className="btn w-full disabled:opacity-60" disabled={busy}>
          {busy ? "Please wait…" : mode === "signup" ? "Create account and continue" : "Sign in and continue"}
        </button>
      </form>
    </div>
  );
}

export default AuthPanel;
