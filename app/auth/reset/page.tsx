"use client";

import Link from "next/link";
import { useState } from "react";
import SiteShell from "@/components/layout/SiteShell";
import PasswordField from "@/components/auth/PasswordField";
import { ArrowIcon, CheckIcon, LockIcon, ShieldIcon } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";

function ResetForm() {
  const { user, ready, recovering, updatePassword } = useAuth();
  const { open } = useUI();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  if (done) {
    return (
      <div className="rounded-[2rem] border border-forest/10 bg-white p-8 text-center shadow-soft sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-leaf/10 text-leaf shadow-sm">
          <CheckIcon width={28} height={28} />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold text-forest sm:text-3xl">Password Updated!</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          Your account password has been successfully reset. You can now continue shopping and manage your orders.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/shop" className="btn-primary">
            Explore Storefront
            <ArrowIcon width={16} height={16} />
          </Link>
          <Link href="/account" className="btn-secondary">
            Go to Account
          </Link>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="rounded-[2rem] border border-forest/10 bg-white p-8 text-center shadow-soft">
        <span className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-clay border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-forest">Verifying your security link…</p>
      </div>
    );
  }

  if (!recovering && !user) {
    return (
      <div className="rounded-[2rem] border border-forest/10 bg-white p-8 text-center shadow-soft sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-clay/10 text-clay shadow-sm">
          <LockIcon width={28} height={28} />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold text-forest">Link Expired or Invalid</h2>
        <p className="mt-2.5 text-sm leading-relaxed text-ink/70">
          This password reset link has expired or has already been used. Please request a fresh reset link from the sign-in window.
        </p>
        <button
          type="button"
          onClick={() => open("account")}
          className="btn-primary mt-6 w-full"
        >
          Request New Link
        </button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setError("Password must be at least 8 characters.");
    if (pw !== pw2) return setError("Passwords do not match. Please re-enter.");
    setBusy(true);
    setError("");
    const r = await updatePassword(pw);
    setBusy(false);
    if (r.error) {
      setError(r.error);
    } else {
      setDone(true);
    }
  };

  return (
    <div className="rounded-[2.25rem] border border-forest/10 bg-white p-7 shadow-lift sm:p-10">
      <div className="flex items-center gap-3.5 border-b border-forest/[0.08] pb-6">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-forest/10 text-forest shadow-sm">
          <ShieldIcon width={22} height={22} />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-forest sm:text-2xl">Create New Password</h2>
          <p className="text-xs text-ink/60">Choose a strong, memorable password</p>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="mt-6 space-y-5">
        <PasswordField
          id="new-pw"
          label="New Password"
          value={pw}
          onChange={setPw}
          autoComplete="new-password"
          hint="Must be at least 8 characters long."
        />

        <PasswordField
          id="new-pw2"
          label="Confirm New Password"
          value={pw2}
          onChange={setPw2}
          autoComplete="new-password"
        />

        {error && (
          <div role="alert" className="rounded-xl bg-clay/10 p-3.5 text-sm font-medium text-clay">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn-primary mt-2 w-full disabled:opacity-60"
        >
          {busy ? "Updating Password…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPage() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-cream py-14 sm:py-20 md:py-24">
        {/* Background ambient accents */}
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-honey/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-leaf/10 blur-3xl" />

        <div className="relative mx-auto max-w-lg px-4 sm:px-6">
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-clay shadow-sm ring-1 ring-clay/20">
              Account Security
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-forest sm:text-4xl">
              Reset Your <span className="italic text-clay">Password</span>
            </h1>
            <p className="mt-2 text-sm text-ink/70">
              Set a secure new password for your Magna Eco Bites account.
            </p>
          </div>

          <ResetForm />
        </div>
      </section>
    </SiteShell>
  );
}
