"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import PasswordField from "./PasswordField";
import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";
import { checkAdmin } from "@/services/adminAccess";

type Mode = "signin" | "signup" | "forgot";
const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function AuthDialog() {
  const { panel, close, open: openPanel } = useUI();
  const router = useRouter();
  const { user, ready, isAdmin, configured, signIn, signUp, signOut, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const firstField = useRef<HTMLInputElement>(null);
  const open = panel === "account";

  // /?signin=1 (used when someone opens a protected page such as /admin while signed out).
  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("signin") === "1") {
      if (!user) openPanel("account");
      params.delete("signin");
      const qs = params.toString();
      window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
    }
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset transient state each time the dialog opens or the mode changes.
  useEffect(() => { if (open) { setError(""); setNotice(""); } }, [open]);
  const switchMode = (m: Mode) => { setError(""); setNotice(""); setMode(m); };
  useEffect(() => { if (!open) { setPassword(""); setBusy(false); } }, [open]);
  // Close after a successful sign-in.
  useEffect(() => { if (open && user && mode !== "signin") setMode("signin"); }, [open, user, mode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setNotice("");
    if (mode === "signup" && !name.trim()) return setError("Please enter your name.");
    if (!EMAIL_RE.test(email.trim())) return setError("Please enter a valid email address.");
    if (mode !== "forgot" && password.length < 8) return setError("Password must be at least 8 characters.");
    setBusy(true);
    try {
      if (mode === "signin") {
        const r = await signIn(email, password);
        if (r.error) return setError(r.error);
        close();
        // The server decides who is an admin; admins go straight to the admin panel.
        if (await checkAdmin()) router.push("/admin");
      } else if (mode === "signup") {
        const r = await signUp(name, email, password);
        if (r.error) return setError(r.error);
        if (r.needsConfirmation) { setNotice(`We've sent a confirmation link to ${email.trim()}. Open it to activate your account, then sign in.`); setMode("signin"); }
        else close();
      } else {
        const r = await sendPasswordReset(email);
        if (r.error) return setError(r.error);
        setNotice(`If an account exists for ${email.trim()}, a reset link is on its way.`);
      }
    } finally {
      setBusy(false);
    }
  };

  const title = user ? "Your account" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password";

  return (
    <Dialog open={open} onClose={close} variant="center" title={title} initialFocus={() => firstField.current}>
      {user ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-2xl border border-forest/10 bg-sand/40 p-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-forest font-display text-lg font-bold text-cream shadow-sm">
              {user.name[0]?.toUpperCase() || "M"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-bold text-forest">Hello, {user.name.split(" ")[0]}.</p>
              <p className="truncate text-xs text-ink/65">{user.email}</p>
            </div>
          </div>
          <div className="grid gap-2.5 pt-2">
            {isAdmin && <Link href="/admin" onClick={close} className="btn-primary w-full">Open admin panel</Link>}
            {!isAdmin && <Link href="/orders" onClick={close} className="btn-primary w-full">My orders</Link>}
            <Link href="/account" onClick={close} className="btn-secondary w-full">Manage account</Link>
            <button type="button" className="btn-secondary w-full" onClick={async () => { await signOut(); close(); }}>Sign out</button>
          </div>
        </div>
      ) : !configured ? (
        <p role="alert" className="rounded-2xl bg-sand p-4 text-sm leading-relaxed text-ink/75">
          Login isn&apos;t set up yet. Add <code className="rounded bg-white/70 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="rounded bg-white/70 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code className="rounded bg-white/70 px-1">.env.local</code>, then restart the server.
        </p>
      ) : (
        <form onSubmit={submit} noValidate>
          {mode !== "forgot" && (
            <div role="tablist" aria-label="Account" className="mb-5 grid grid-cols-2 rounded-full bg-sand p-1 text-sm font-semibold">
              {(["signin", "signup"] as const).map((m) => (
                <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => switchMode(m)} className={`focus-ring rounded-full py-2.5 transition-colors ${mode === m ? "bg-forest text-cream shadow-soft" : "text-forest/70 hover:text-forest"}`}>
                  {m === "signin" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>
          )}
          {mode === "forgot" && (
            <div className="mb-5 rounded-2xl border border-forest/10 bg-sand/40 p-4 text-center">
              <p className="font-display text-base font-bold text-forest">Forgot your password?</p>
              <p className="mt-1 text-xs leading-relaxed text-ink/70">
                Enter your registered email address and we&apos;ll send you a secure link to set a new password.
              </p>
            </div>
          )}
          <div className="space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="auth-name" className="mb-1.5 block text-sm font-semibold text-forest">Full name</label>
                <input id="auth-name" ref={firstField} className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div>
              <label htmlFor="auth-email" className="mb-1.5 block text-sm font-semibold text-forest">Email</label>
              <input id="auth-email" ref={mode === "signup" ? undefined : firstField} type="email" inputMode="email" className="field" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {mode !== "forgot" && (
              <PasswordField id="auth-password" label="Password" value={password} onChange={setPassword} autoComplete={mode === "signin" ? "current-password" : "new-password"} hint={mode === "signup" ? "At least 8 characters." : undefined} />
            )}
          </div>
          {error && <p role="alert" className="mt-4 text-sm font-medium text-clay">{error}</p>}
          {notice && <p role="status" className="mt-4 rounded-2xl bg-leaf/10 p-3 text-sm text-forest">{notice}</p>}
          <button type="submit" disabled={busy} className="btn-primary mt-6 w-full disabled:opacity-60">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
          </button>
          <div className="mt-4 text-center text-sm">
            {mode === "signin" && <button type="button" className="focus-ring rounded font-semibold text-forest underline-offset-4 hover:text-clay hover:underline" onClick={() => switchMode("forgot")}>Forgot password?</button>}
            {mode === "forgot" && <button type="button" className="focus-ring rounded font-semibold text-forest underline-offset-4 hover:text-clay hover:underline" onClick={() => switchMode("signin")}>Back to sign in</button>}
          </div>
        </form>
      )}
    </Dialog>
  );
}
