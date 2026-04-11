import { redirect } from "next/navigation";

export default function HomePage() {
  const isSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (isSupabase) {
    redirect("/login");
  } else {
    redirect("/inspector");
  }
}
