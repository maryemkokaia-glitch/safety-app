"use client";

import { DemoProvider } from "./demo-context";
import { AuthProvider } from "./supabase/auth-context";
import { SupabaseDataProvider } from "./supabase/data-provider";

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  if (isSupabaseConfigured) {
    return (
      <AuthProvider>
        <SupabaseDataProvider>{children}</SupabaseDataProvider>
      </AuthProvider>
    );
  }
  return <DemoProvider>{children}</DemoProvider>;
}
