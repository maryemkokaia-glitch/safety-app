"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { t, type Lang, type TranslationKey } from "@/lib/i18n";

function useLang() {
  const [lang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "ka";
    try {
      const stored = JSON.parse(localStorage.getItem("safety_app_data") || "{}");
      return stored.lang || "ka";
    } catch { return "ka"; }
  });
  return (key: TranslationKey) => t(key, lang);
}

const inputStyle = "bg-gray-50 focus:bg-white border-gray-200 py-3.5 min-h-[52px]";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const tr = useLang();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError(tr("auth.err_email_required")); return; }
    if (!password) { setError(tr("auth.err_password_required")); return; }

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
          setError(tr("auth.err_invalid_credentials"));
        } else if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
          setError(tr("auth.err_email_not_confirmed"));
        } else if (msg.includes("too many") || msg.includes("rate limit") || msg.includes("429")) {
          setError(tr("auth.err_rate_limit"));
        } else if (msg.includes("network") || msg.includes("fetch")) {
          setError(tr("auth.err_network"));
        } else {
          setError(tr("auth.err_login_failed") + authError.message);
        }
        setLoading(false);
        return;
      }

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
    } catch {
      setError(tr("auth.err_network"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Branding */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-4 pt-12">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{tr("app.name")}</h1>
        <p className="text-sm text-gray-500 mt-1">{tr("auth.safety_mgmt")}</p>
      </div>

      {/* Form */}
      <div className="px-5 pb-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-sm mx-auto w-full">
          <h2 className="text-lg font-bold text-gray-900 mb-1">{tr("auth.login")}</h2>
          <p className="text-sm text-gray-500 mb-5">{tr("auth.login_subtitle")}</p>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 text-red-700 text-sm p-3.5 rounded-xl mb-4 border border-red-100">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              label={tr("auth.email")}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className={inputStyle}
              required
            />

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                {tr("auth.password")}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={tr("auth.password_placeholder")}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className={`${inputStyle} pr-12`}
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

            <Button type="submit" disabled={loading} size="lg" className="w-full font-bold">
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" />{tr("loading")}</>
              ) : (
                tr("auth.login")
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          {tr("auth.no_account")}{" "}
          <Link href="/register" className="text-blue-600 font-semibold hover:underline">
            {tr("auth.register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
