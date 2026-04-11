"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!email.trim()) {
      setError("შეიყვანეთ ელ-ფოსტა");
      return;
    }
    if (!password) {
      setError("შეიყვანეთ პაროლი");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes("invalid login") || msg.includes("invalid_credentials")) {
          setError("არასწორი ელ-ფოსტა ან პაროლი. შეამოწმეთ და სცადეთ თავიდან.");
        } else if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
          setError("ელ-ფოსტა ჯერ არ არის დადასტურებული. შეამოწმეთ ინბოქსი (და სპამის საქაღალდე) და დააჭირეთ დადასტურების ბმულს.");
        } else if (msg.includes("too many") || msg.includes("rate limit") || msg.includes("429")) {
          setError("ძალიან ბევრი მცდელობა. გთხოვთ მოიცადოთ 1 წუთი და სცადოთ თავიდან.");
        } else if (msg.includes("network") || msg.includes("fetch")) {
          setError("კავშირის პრობლემა. შეამოწმეთ ინტერნეტი.");
        } else {
          setError("შესვლა ვერ მოხერხდა: " + authError.message);
        }
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
    } catch (err) {
      setError("კავშირის პრობლემა. შეამოწმეთ ინტერნეტი.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top area with branding */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-4 pt-12">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">SafetyApp</h1>
        <p className="text-sm text-gray-500 mt-1">შრომის უსაფრთხოების მართვა</p>
      </div>

      {/* Form card */}
      <div className="px-5 pb-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-sm mx-auto w-full">
          <h2 className="text-lg font-bold text-gray-900 mb-1">შესვლა</h2>
          <p className="text-sm text-gray-500 mb-5">შედით თქვენს ანგარიშში</p>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 text-red-700 text-sm p-3.5 rounded-xl mb-4 border border-red-100">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                ელ-ფოსტა
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-base bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[52px]"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                პაროლი
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="შეიყვანეთ პაროლი"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3.5 pr-12 text-base bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[52px]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-base py-3.5 rounded-xl transition-colors min-h-[52px] flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  იტვირთება...
                </>
              ) : (
                "შესვლა"
              )}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-gray-500 mt-5">
          არ გაქვთ ანგარიში?{" "}
          <Link href="/register" className="text-blue-600 font-semibold hover:underline">
            რეგისტრაცია
          </Link>
        </p>
      </div>
    </div>
  );
}
