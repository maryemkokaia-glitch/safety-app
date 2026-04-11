"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  useEffect(() => {
    async function logout() {
      const supabase = createClient();
      await supabase.auth.signOut();
      // Clear all cookies and storage
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/");
      });
      localStorage.clear();
      window.location.href = "/login";
    }
    logout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-500">გასვლა...</p>
    </div>
  );
}
