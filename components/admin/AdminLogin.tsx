"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

/**
 * Sign-in screen shown at /admin (and every admin URL) until a valid admin session exists.
 * Signing in only proves who you are; the server then checks admin_members before any data loads.
 */
export default function AdminLogin({ notice }: { notice?: string }) {
  const { signIn, sendPasswordReset, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (!password) return setError("Enter your password.");
    setBusy(true);
    const r = await signIn(email, password);
    setBusy(false);
    if (r.error) setError(r.error);
    // On success the admin shell re-checks access with the server and opens the panel.
  };

  const forgot = async () => {
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter your email first, then choose “Forgot password?”.");
    const r = await sendPasswordReset(email);
    if (r.error) setError(r.error);
    else setInfo(`If an admin account exists for ${email.trim()}, a reset link is on its way.`);
  };

  return (
    <main className="adm-auth">
      <div className="adm-auth-shell">
        <section className="adm-auth-story" aria-label="Magna Eco Bites admin portal">
          <Link href="/" className="adm-auth-brand">
            <span className="adm-auth-logo" aria-hidden="true">M</span>
            <span>
              <b>Magna Eco Bites</b>
              <small>ADMIN CONSOLE</small>
            </span>
          </Link>
          <div className="adm-auth-intro">
            <span className="adm-auth-kicker"><i aria-hidden="true" /> SECURE ADMIN WORKSPACE</span>
            <h1>Good work<br />starts with a clear view.</h1>
            <p>Manage orders, products and your store operations from one quiet, focused space.</p>
          </div>
          <div className="adm-auth-assurance">
            <span className="adm-auth-lock" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="4.5" y="10" width="15" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
              </svg>
            </span>
            <span>
              <b>Private by design</b>
              <small>Admin access is limited to authorised accounts.</small>
            </span>
          </div>
          <span className="adm-auth-orbit adm-auth-orbit-one" aria-hidden="true" />
          <span className="adm-auth-orbit adm-auth-orbit-two" aria-hidden="true" />
        </section>

        <section className="adm-auth-panel" aria-labelledby="admin-sign-in-title">
          <form onSubmit={submit} className="adm-auth-form" noValidate>
            <div className="adm-auth-heading">
              <span className="adm-auth-eyebrow">WELCOME BACK</span>
              <h2 id="admin-sign-in-title">Admin sign in</h2>
              <p>Enter your administrator credentials to continue.</p>
            </div>

            {notice && <div className="adm-auth-notice" role="status">{notice}</div>}

            {!configured ? (
              <p className="adm-auth-error" role="alert">Login isn&apos;t configured on this site.</p>
            ) : (
              <>
                <div className="adm-auth-field">
                  <label htmlFor="al-email">Email address</label>
                  <div className="adm-auth-input-wrap">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
                      <path d="m4.5 7 7.5 5.5L19.5 7" />
                    </svg>
                    <input
                      id="al-email"
                      className="adm-in"
                      type="email"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="adm-auth-field">
                  <label htmlFor="al-pass">Password</label>
                  <div className="adm-auth-input-wrap">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="5" y="10" width="14" height="10" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
                    </svg>
                    <input
                      id="al-pass"
                      className="adm-in"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      className="adm-auth-reveal"
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((visible) => !visible)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {error && <p className="adm-auth-error" id="al-error" role="alert">{error}</p>}
                {info && <p className="adm-auth-info" id="al-info" role="status">{info}</p>}

                <button type="submit" className="adm-auth-submit" disabled={busy}>
                  <span>{busy ? "Signing in…" : "Sign in to admin"}</span>
                  <span aria-hidden="true">→</span>
                </button>

                <div className="adm-auth-links">
                  <button type="button" onClick={forgot}>Forgot password?</button>
                  <Link href="/">Back to the shop</Link>
                </div>
              </>
            )}
          </form>
          <p className="adm-auth-footnote">Magna Eco Bites <span aria-hidden="true">·</span> Store management</p>
        </section>
      </div>
    </main>
  );
}
