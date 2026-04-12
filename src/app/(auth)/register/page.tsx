"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Loader2, Mail, Shield, ClipboardCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogoFull } from "@/components/ui/logo";
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

const sniperLinks: Record<string, { url: string; labelKey: TranslationKey }> = {
  "gmail.com": { url: "https://mail.google.com", labelKey: "auth.open_gmail" },
  "googlemail.com": { url: "https://mail.google.com", labelKey: "auth.open_gmail" },
  "outlook.com": { url: "https://outlook.live.com", labelKey: "auth.open_outlook" },
  "hotmail.com": { url: "https://outlook.live.com", labelKey: "auth.open_outlook" },
  "yahoo.com": { url: "https://mail.yahoo.com", labelKey: "auth.open_yahoo" },
  "icloud.com": { url: "https://www.icloud.com/mail", labelKey: "auth.open_icloud" },
  "mail.ru": { url: "https://mail.ru", labelKey: "auth.open_mailru" },
};

import { Suspense } from "react";

export default function RegisterPageWrapper() {
  return <Suspense><RegisterPageInner /></Suspense>;
}

function RegisterPageInner() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const [selectedRole, setSelectedRole] = useState<"client" | "inspector">(
    roleParam === "client" ? "client" : "inspector"
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const tr = useLang();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) { setError(tr("auth.err_name_required")); return; }
    if (!email.trim()) { setError(tr("auth.err_email_required")); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError(tr("auth.err_email_format")); return; }
    if (password.length < 6) { setError(tr("auth.err_password_weak")); return; }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: selectedRole,
            phone: phone.trim() || undefined,
          },
        },
      });

      if (signUpError) {
        const msg = signUpError.message;
        if (msg.includes("already registered") || msg.includes("already been registered")) {
          setError(tr("auth.err_already_registered"));
        } else if (msg.includes("valid email") || msg.includes("invalid")) {
          setError(tr("auth.err_invalid_email"));
        } else if (msg.includes("password") || msg.includes("weak")) {
          setError(tr("auth.err_password_too_weak"));
        } else if (msg.includes("rate limit") || msg.includes("429")) {
          setError(tr("auth.err_rate_limit"));
        } else if (msg.includes("Database error")) {
          setError(tr("auth.err_server"));
        } else {
          setError(tr("auth.err_register_failed") + msg);
        }
        setLoading(false);
        return;
      }

      if (signUpData?.session) {
        router.push(`/${selectedRole}`);
        router.refresh();
        return;
      }

      setSuccess(true);
    } catch {
      setError(tr("auth.err_network"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    const domain = email.split("@")[1]?.toLowerCase();
    const sniper = sniperLinks[domain];

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8 text-navy-800" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{tr("auth.check_email")}</h2>
          <p className="text-sm text-gray-500 mb-2">{tr("auth.confirm_sent")}</p>
          <p className="text-sm font-semibold text-gray-900 bg-gray-50 rounded-xl px-4 py-2.5 mb-5">
            {email}
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-left">
            <p className="text-sm text-amber-800 font-medium mb-1">{tr("auth.what_to_do")}</p>
            <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
              <li>{tr("auth.step_open_email")}</li>
              <li>{tr("auth.step_find_email")}</li>
              <li>{tr("auth.step_click_link")}</li>
              <li>{tr("auth.step_sign_in")}</li>
            </ol>
          </div>

          {sniper && (
            <a
              href={sniper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full mb-3"
            >
              <Button size="lg" className="w-full font-bold">
                {tr(sniper.labelKey)}
              </Button>
            </a>
          )}

          <Link href="/login" className="block w-full">
            <Button variant="secondary" size="lg" className="w-full font-semibold">
              {tr("auth.go_to_login")}
            </Button>
          </Link>

          <p className="text-xs text-gray-400 mt-4">{tr("auth.check_spam")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Branding */}
      <div className="flex items-center justify-center px-5 pt-12 pb-4">
        <LogoFull size="md" />
      </div>

      {/* Form */}
      <div className="flex-1 px-5 pb-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-sm mx-auto w-full">
          <h2 className="text-lg font-bold text-gray-900 mb-1">{tr("auth.register")}</h2>
          <p className="text-sm text-gray-500 mb-4">{tr("auth.register_subtitle")}</p>

          {/* Role Selection */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{tr("auth.select_role")}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole("client")}
                className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 transition-all min-h-[80px] ${
                  selectedRole === "client"
                    ? "border-navy-800 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <Shield className={`w-5 h-5 ${selectedRole === "client" ? "text-navy-800" : "text-gray-400"}`} />
                <span className={`text-sm font-semibold ${selectedRole === "client" ? "text-navy-800" : "text-gray-700"}`}>
                  {tr("auth.role_client")}
                </span>
                <span className="text-xs text-gray-400">{tr("auth.role_client_desc")}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("inspector")}
                className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 transition-all min-h-[80px] ${
                  selectedRole === "inspector"
                    ? "border-navy-800 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <ClipboardCheck className={`w-5 h-5 ${selectedRole === "inspector" ? "text-navy-800" : "text-gray-400"}`} />
                <span className={`text-sm font-semibold ${selectedRole === "inspector" ? "text-navy-800" : "text-gray-700"}`}>
                  {tr("auth.role_inspector")}
                </span>
                <span className="text-xs text-gray-400">{tr("auth.role_inspector_desc")}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 text-red-700 text-sm p-3.5 rounded-xl mb-4 border border-red-100">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              label={tr("auth.full_name")}
              placeholder="გიორგი გიორგაძე"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setError(""); }}
              className={inputStyle}
              required
            />

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
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                {tr("auth.phone")} <span className="text-gray-400 font-normal">({tr("auth.phone_optional")})</span>
              </label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+995 555 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                {tr("auth.password")}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={tr("auth.password_min")}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  minLength={6}
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
              {password.length > 0 && password.length < 6 && (
                <p className="text-xs text-amber-600 mt-1.5">
                  {tr("auth.password_min")} ({6 - password.length} {tr("auth.password_remaining")})
                </p>
              )}
            </div>

            <Button type="submit" disabled={loading} size="lg" className="w-full font-bold">
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" />{tr("loading")}</>
              ) : (
                tr("auth.register")
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          {tr("auth.have_account")}{" "}
          <Link href="/login" className="text-navy-800 font-semibold hover:underline">
            {tr("auth.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
