"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("არასწორი ელ-ფოსტა ან პაროლი");
      setLoading(false);
      return;
    }

    // Get role and redirect
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      router.push(`/${profile?.role || "inspector"}`);
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600">
            <Shield className="w-8 h-8" />
            <span className="text-2xl font-bold">SafetyApp</span>
          </Link>
          <p className="text-gray-500 mt-2">შედით თქვენს ანგარიშში</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
          )}

          <Input
            id="email"
            label="ელ-ფოსტა"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            id="password"
            label="პაროლი"
            type="password"
            placeholder="შეიყვანეთ პაროლი"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "იტვირთება..." : "შესვლა"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          არ გაქვთ ანგარიში?{" "}
          <Link href="/register" className="text-blue-600 font-medium hover:underline">
            რეგისტრაცია
          </Link>
        </p>
      </div>
    </div>
  );
}
