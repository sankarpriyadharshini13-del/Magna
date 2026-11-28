"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as auth from "@/services/auth";
import { checkAdmin } from "@/services/adminAccess";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { UserProfile } from "@/types";

interface AuthValue {
  user: UserProfile | null;
  /** False until the initial session check finished. */
  ready: boolean;
  configured: boolean;
  /** True when the server confirmed this user is an admin. */
  isAdmin: boolean;
  /** True right after the user opened a password-recovery email link. */
  recovering: boolean;
  signIn: typeof auth.signIn;
  signUp: typeof auth.signUp;
  signOut: () => Promise<void>;
  sendPasswordReset: typeof auth.sendPasswordReset;
  updatePassword: typeof auth.updatePassword;
  updateProfile: (fields: { name: string; phone: string }) => Promise<auth.Result>;
}
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;
    // The initial session read and the first auth event race each other: if the event lands first,
    // ignore the older getSession() result so it can never overwrite a fresh sign-in with null.
    let authEventSeen = false;
    auth.getSession().then((u) => {
      if (alive && !authEventSeen) {
        setUser(u);
        setReady(true);
      }
    });
    const off = auth.onAuthChange((event, profile) => {
      if (!alive) return;
      authEventSeen = true;
      setUser(profile);
      setReady(true);
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      if (event === "SIGNED_OUT") setRecovering(false);
    });
    return () => {
      alive = false;
      off();
    };
  }, []);

  // Ask the server (not the browser) whether this account is an admin.
  useEffect(() => {
    let alive = true;
    if (!user) {
      setIsAdmin(false);
      return;
    }
    checkAdmin().then((ok) => alive && setIsAdmin(ok));
    return () => {
      alive = false;
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = useCallback(async () => {
    await auth.signOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (fields: { name: string; phone: string }) => {
      if (!user) return { error: "You're signed out." };
      const res = await auth.updateProfile(user.id, fields);
      if (!res.error) setUser({ ...user, name: fields.name.trim(), phone: fields.phone.trim() || null });
      return res;
    },
    [user],
  );

  const value = useMemo<AuthValue>(
    () => ({
      user,
      ready,
      configured: isSupabaseConfigured,
      recovering,
      isAdmin,
      signIn: auth.signIn,
      signUp: auth.signUp,
      signOut,
      sendPasswordReset: auth.sendPasswordReset,
      updatePassword: auth.updatePassword,
      updateProfile,
    }),
    [user, ready, recovering, isAdmin, signOut, updateProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
