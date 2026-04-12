"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoFull } from "@/components/ui/logo";
import { t, type Lang, type TranslationKey } from "@/lib/i18n";

interface LandingHeaderProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

export function LandingHeader({ lang, onLangChange }: LandingHeaderProps) {
  const tr = (key: TranslationKey) => t(key, lang);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
        <LogoFull size="sm" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => onLangChange(lang === "ka" ? "en" : "ka")}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors min-h-[36px]"
          >
            {lang === "ka" ? "EN" : "KA"}
          </button>

          <Link href="/login">
            <Button variant="ghost" size="sm">{tr("auth.login")}</Button>
          </Link>

          <Link href="/register">
            <Button size="sm">{tr("auth.register")}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
