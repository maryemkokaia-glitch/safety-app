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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single();

          if (profile) {
            setUser(profile);
          } else {
            // Profile query failed — build user from auth metadata
            console.warn("Profile not found, using auth metadata:", profileError?.message);
            setUser({
              id: authUser.id,
              email: authUser.email || "",
              full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
              phone: authUser.user_metadata?.phone || null,
              role: authUser.user_metadata?.role || "inspector",
              company_id: null,
              avatar_url: null,
              created_at: authUser.created_at,
            });
          }
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
      setLoading(false);
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUser(profile);
        } else {
          // Fallback to auth metadata
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
            phone: session.user.user_metadata?.phone || null,
            role: session.user.user_metadata?.role || "inspector",
            company_id: null,
            avatar_url: null,
            created_at: session.user.created_at,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
