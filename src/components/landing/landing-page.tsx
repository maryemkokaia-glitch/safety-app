"use client";

import { useState } from "react";
import { LandingHeader } from "./landing-header";
import { HeroSection } from "./hero-section";
import { ValuePropsSection } from "./value-props-section";
import { PublicRegulations } from "./public-regulations";
import { LandingFooter } from "./landing-footer";
import { t, type Lang, type TranslationKey } from "@/lib/i18n";
import type { Regulation } from "@/lib/database.types";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  regulations: Regulation[];
}

export function LandingPage({ regulations }: LandingPageProps) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "ka";
    try {
      const stored = JSON.parse(localStorage.getItem("safety_app_data") || "{}");
      return stored.lang || "ka";
    } catch {
      return "ka";
    }
  });

  function handleLangChange(newLang: Lang) {
    setLang(newLang);
    try {
      const stored = JSON.parse(localStorage.getItem("safety_app_data") || "{}");
      stored.lang = newLang;
      localStorage.setItem("safety_app_data", JSON.stringify(stored));
    } catch {
      // ignore
    }
  }

  const tr = (key: TranslationKey) => t(key, lang);

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader lang={lang} onLangChange={handleLangChange} />
      <HeroSection lang={lang} />
      <ValuePropsSection lang={lang} />
      <PublicRegulations regulations={regulations} lang={lang} />

      {/* CTA Section */}
      <section className="py-16 px-5 bg-navy-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
            {tr("landing.cta_title")}
          </h2>
          <p className="text-gray-300 mb-8">
            {tr("landing.cta_subtitle")}
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-navy-800 hover:bg-gray-100 text-base px-8">
              {tr("landing.cta_register")}
            </Button>
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
