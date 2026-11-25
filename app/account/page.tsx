"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SiteShell from "@/components/layout/SiteShell";
import { ArrowIcon, CheckIcon, LockIcon, PackageIcon, ShieldIcon, UserIcon } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";

function AccountContent() {
  const { user, ready, configured, updateProfile, signOut, sendPasswordReset } = useAuth();
  const { open } = useUI();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-6 shadow-soft">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-clay border-t-transparent" />
          <p className="text-sm font-semibold text-forest">Loading your account details…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg rounded-[2rem] border border-forest/10 bg-white p-8 text-center shadow-soft sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-sand/60 text-forest shadow-sm">
          <UserIcon width={28} height={28} />
        </span>
        <h2 className="mt-5 font-display text-2xl font-semibold text-forest">Sign In to Your Account</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          {configured
            ? "Sign in to manage your delivery details, view past orders, and personalize your experience."
            : "Customer login is currently being set up. Please check back shortly."}
        </p>
        {configured && (
          <button
            type="button"
            className="btn-primary mt-6 w-full"
            onClick={() => open("account")}
          >
            Sign In / Register
          </button>
        )}
      </div>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setMsg({ ok: false, text: "Please enter your name." });
    setBusy(true);
    setMsg(null);
    const r = await updateProfile({ name, phone });
    setBusy(false);
    setMsg(r.error ? { ok: false, text: r.error } : { ok: true, text: "Profile details updated successfully." });
  };

  const handleResetPassword = async () => {
    if (!user.email) return;
    setResetBusy(true);
    setResetSent(false);
    const r = await sendPasswordReset(user.email);
    setResetBusy(false);
    if (!r.error) {
      setResetSent(true);
    }
  };

  const initials = (user.name ?? "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "M";

  return (
    <div className="space-y-8">
      {/* Profile Overview Card */}
      <div className="relative overflow-hidden rounded-[2rem] border border-forest/10 bg-gradient-to-br from-white via-cream/40 to-sand/40 p-6 shadow-soft sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-honey/15 blur-2xl" />
        
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-forest font-display text-2xl font-bold text-cream shadow-md ring-4 ring-cream">
              {initials}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-display text-2xl font-bold text-forest sm:text-3xl">{user.name}</h2>
                <span className="rounded-full bg-leaf/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-leaf">
                  Verified Member
                </span>
              </div>
              <p className="mt-1 break-all text-sm text-ink/65">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/orders"
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream shadow-soft transition-all duration-300 hover:bg-forest-deep hover:shadow-lift"
            >
              <PackageIcon width={16} height={16} />
              My Orders
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-forest/20 bg-white/80 px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:border-forest hover:bg-forest hover:text-cream"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form on Left, Quick Cards on Right */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Personal Information Form */}
        <div className="lg:col-span-7">
          <div className="rounded-[2rem] border border-forest/10 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-center gap-3 border-b border-forest/[0.08] pb-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-clay/10 text-clay">
                <UserIcon width={20} height={20} />
              </span>
              <div>
                <h3 className="font-display text-xl font-bold text-forest">Personal Information</h3>
                <p className="text-xs text-ink/60">Update your account name and contact number</p>
              </div>
            </div>

            <form onSubmit={save} className="mt-6 space-y-5" noValidate>
              <div>
                <label htmlFor="p-email" className="mb-1.5 block text-sm font-semibold text-forest">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="p-email"
                    type="email"
                    readOnly
                    value={user.email}
                    className="w-full rounded-xl border border-forest/10 bg-sand/30 px-4 py-3 text-sm text-ink/75 outline-none cursor-not-allowed"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink/40">
                    Primary email
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink/50">Your email address is linked to your account orders and cannot be changed here.</p>
              </div>

              <div>
                <label htmlFor="p-name" className="mb-1.5 block text-sm font-semibold text-forest">
                  Full Name
                </label>
                <input
                  id="p-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:border-forest focus:ring-4 focus:ring-leaf/15"
                />
              </div>

              <div>
                <label htmlFor="p-phone" className="mb-1.5 block text-sm font-semibold text-forest">
                  Phone Number <span className="font-normal text-ink/50">(Optional)</span>
                </label>
                <input
                  id="p-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:border-forest focus:ring-4 focus:ring-leaf/15"
                />
                <p className="mt-1 text-xs text-ink/50">Used for courier delivery updates and shipment notifications.</p>
              </div>

              {msg && (
                <div
                  role={msg.ok ? "status" : "alert"}
                  className={`flex items-center gap-2.5 rounded-xl p-4 text-sm font-medium ${
                    msg.ok ? "bg-leaf/10 text-leaf" : "bg-clay/10 text-clay"
                  }`}
                >
                  {msg.ok && <CheckIcon width={16} height={16} />}
                  <span>{msg.text}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary min-w-[140px] disabled:opacity-60"
                >
                  {busy ? "Saving Changes…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Quick Access & Security */}
        <div className="space-y-6 lg:col-span-5">
          {/* Order History Tile */}
          <div className="group rounded-[2rem] border border-forest/10 bg-white p-6 shadow-soft transition-all duration-300 hover:shadow-lift sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-forest/10 text-forest transition-transform duration-300 group-hover:scale-105">
                <PackageIcon width={22} height={22} />
              </span>
              <div>
                <h4 className="font-display text-lg font-bold text-forest">Order History</h4>
                <p className="text-xs text-ink/60">Live parcels and invoices</p>
              </div>
            </div>
            <p className="mt-3.5 text-sm leading-relaxed text-ink/70">
              Track active dispatches, view invoice copies, and reorder your favorite stone-ground podis and oils.
            </p>
            <Link
              href="/orders"
              className="focus-ring mt-5 inline-flex items-center gap-2 rounded-full bg-sand/60 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-forest transition-colors hover:bg-forest hover:text-cream"
            >
              View My Orders
              <ArrowIcon width={13} height={13} />
            </Link>
          </div>

          {/* Account Security Tile */}
          <div className="rounded-[2rem] border border-forest/10 bg-white p-6 shadow-soft sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-clay/10 text-clay">
                <ShieldIcon width={22} height={22} />
              </span>
              <div>
                <h4 className="font-display text-lg font-bold text-forest">Security & Password</h4>
                <p className="text-xs text-ink/60">Manage login credentials</p>
              </div>
            </div>
            <p className="mt-3.5 text-sm leading-relaxed text-ink/70">
              Need to change your password? We will securely send an authentication link directly to your inbox.
            </p>
            {resetSent ? (
              <div className="mt-4 rounded-xl bg-leaf/10 p-3.5 text-xs font-semibold text-leaf">
                A password reset link was sent to {user.email}. Please check your inbox.
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetBusy}
                className="focus-ring mt-5 inline-flex items-center gap-2 rounded-full border border-forest/15 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-forest transition-colors hover:border-forest hover:bg-forest hover:text-cream disabled:opacity-50"
              >
                {resetBusy ? "Sending link…" : "Reset Password"}
                <LockIcon width={13} height={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-cream py-12 sm:py-16 md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-honey/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-clay sm:text-xs">
              Customer Portal
            </p>
            <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-forest sm:text-4xl md:text-5xl">
              Manage Your <span className="italic text-clay">Account</span>
            </h1>
          </div>
          <AccountContent />
        </div>
      </section>
    </SiteShell>
  );
}
