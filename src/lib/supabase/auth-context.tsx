"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "./client";
import type { User } from "../database.types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

function buildUserFromAuth(authUser: any): User {
  return {
    id: authUser.id,
    email: authUser.email || "",
    full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
    phone: authUser.user_metadata?.phone || null,
    role: authUser.user_metadata?.role || "inspector",
    company_id: null,
    avatar_url: null,
    created_at: authUser.created_at,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Hard timeout — never block more than 3 seconds
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth check timed out");
        setLoading(false);
      }
    }, 3000);

    async function getUser() {
      try {
        // First check session (fast, local)
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setLoading(false);
          return;
        }

        // Session exists — build user from it immediately
        const authUser = session.user;
        setUser(buildUserFromAuth(authUser));
        setLoading(false);

        // Then try to get profile in background (non-blocking)
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profile) {
          setUser(profile);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setLoading(false);
      }
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(buildUserFromAuth(session.user));
        // Background profile fetch
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (profile) setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
