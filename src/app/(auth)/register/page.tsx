"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!fullName.trim()) {
      setError("შეიყვანეთ სახელი და გვარი");
      return;
    }
    if (!email.trim()) {
      setError("შეიყვანეთ ელ-ფოსტა");
      return;
    }
    if (password.length < 6) {
      setError("პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: "inspector",
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError("ეს ელ-ფოსტა უკვე რეგისტრირებულია. სცადეთ შესვლა.");
        } else if (signUpError.message.includes("valid email")) {
          setError("შეიყვანეთ სწორი ელ-ფოსტა.");
        } else if (signUpError.message.includes("password")) {
          setError("პაროლი ძალიან სუსტია. გამოიყენეთ მინიმუმ 6 სიმბოლო.");
        } else if (signUpError.message.includes("Database error")) {
          setError("სერვერის შეცდომა. გთხოვთ სცადოთ მოგვიანებით.");
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      // Update phone if provided
      if (phone.trim() && signUpData.user) {
        await supabase
          .from("profiles")
          .update({ phone: phone.trim() })
          .eq("id", signUpData.user.id);
      }

      // Check if email confirmation is required
      if (signUpData.user && !signUpData.session) {
        // Email confirmation required
        setSuccess(true);
        setLoading(false);
        return;
      }

      // Auto-logged in (no email confirmation)
      router.push("/inspector");
      router.refresh();
    } catch (err) {
      setError("კავშირის პრობლემა. შეამოწმეთ ინტერნეტი.");
      setLoading(false);
    }
  }

  // Success state - email confirmation needed
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">რეგისტრაცია წარმატებულია!</h2>
          <p className="text-sm text-gray-500 mb-6">
            დადასტურების ბმული გაიგზავნა <strong className="text-gray-700">{email}</strong>-ზე. შეამოწმეთ თქვენი ინბოქსი.
          </p>
          <Link
            href="/login"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base py-3.5 rounded-xl transition-colors text-center min-h-[52px]"
          >
            შესვლაზე გადასვლა
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top area with branding */}
      <div className="flex items-center justify-center px-5 pt-12 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">SafetyApp</span>
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 px-5 pb-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-sm mx-auto w-full">
          <h2 className="text-lg font-bold text-gray-900 mb-1">რეგისტრაცია</h2>
          <p className="text-sm text-gray-500 mb-5">შექმენით ახალი ანგარიში</p>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 text-red-700 text-sm p-3.5 rounded-xl mb-4 border border-red-100">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                სახელი და გვარი
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="გიორგი გიორგაძე"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setError(""); }}
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-base bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[52px]"
                required
              />
            </div>

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

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                ტელეფონი <span className="text-gray-400 font-normal">(არასავალდებულო)</span>
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+995 555 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-base bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[52px]"
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
                  autoComplete="new-password"
                  placeholder="მინიმუმ 6 სიმბოლო"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  minLength={6}
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
              {password.length > 0 && password.length < 6 && (
                <p className="text-xs text-amber-600 mt-1.5">მინიმუმ 6 სიმბოლო ({6 - password.length} დარჩა)</p>
              )}
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
                "რეგისტრაცია"
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-gray-500 mt-5">
          უკვე გაქვთ ანგარიში?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            შესვლა
          </Link>
        </p>
      </div>
    </div>
  );
}
