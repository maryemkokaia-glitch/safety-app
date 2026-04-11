"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("inspector");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    // Create company if admin
    let companyId: string | null = null;
    if (role === "admin" && companyName) {
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({ name: companyName })
        .select("id")
        .single();

      if (companyError) {
        setError("კომპანიის შექმნა ვერ მოხერხდა");
        setLoading(false);
        return;
      }
      companyId = company.id;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Update profile with company if admin
    if (companyId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ company_id: companyId })
          .eq("id", user.id);
      }
    }

    router.push(`/${role}`);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600">
            <Shield className="w-8 h-8" />
            <span className="text-2xl font-bold">SafetyApp</span>
          </Link>
          <p className="text-gray-500 mt-2">შექმენით ახალი ანგარიში</p>
        </div>

        <form onSubmit={handleRegister} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
          )}

          <Input
            id="fullName"
            label="სახელი და გვარი"
            placeholder="გიორგი გიორგაძე"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

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
            placeholder="მინიმუმ 6 სიმბოლო"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <Select
            id="role"
            label="როლი"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: "admin", label: "ადმინისტრატორი" },
              { value: "inspector", label: "ინსპექტორი" },
              { value: "client", label: "კლიენტი" },
            ]}
          />

          {role === "admin" && (
            <Input
              id="companyName"
              label="კომპანიის სახელი"
              placeholder="შპს სამშენებლო კომპანია"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          )}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "იტვირთება..." : "რეგისტრაცია"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          უკვე გაქვთ ანგარიში?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            შესვლა
          </Link>
        </p>
      </div>
    </div>
  );
}
