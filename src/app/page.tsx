import { LandingPage } from "@/components/landing/landing-page";
import { demoRegulations } from "@/lib/store";
import type { Regulation } from "@/lib/database.types";

async function getRegulations(): Promise<Regulation[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return demoRegulations;
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("regulations")
      .select("*")
      .order("created_at");
    return data ?? demoRegulations;
  } catch {
    return demoRegulations;
  }
}

export default async function HomePage() {
  const regulations = await getRegulations();

  return <LandingPage regulations={regulations} />;
}
