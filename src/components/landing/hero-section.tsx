import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, ClipboardCheck } from "lucide-react";
import { t, type Lang, type TranslationKey } from "@/lib/i18n";

interface HeroSectionProps {
  lang: Lang;
}

export function HeroSection({ lang }: HeroSectionProps) {
  const tr = (key: TranslationKey) => t(key, lang);

  return (
    <section className="py-16 lg:py-24 px-5">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-navy-800 rounded-full px-4 py-2 text-sm font-semibold mb-6">
          <Shield className="w-4 h-4" />
          {tr("app.tagline")}
        </div>

        <h1 className="text-3xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-5 leading-tight">
          {tr("landing.hero_title")}
        </h1>

        <p className="text-base lg:text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          {tr("landing.hero_subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register?role=client">
            <Button size="lg" className="w-full sm:w-auto text-base px-8">
              <Shield className="w-5 h-5 mr-2" />
              {tr("landing.find_expert")}
            </Button>
          </Link>

          <Link href="/register?role=inspector">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
              <ClipboardCheck className="w-5 h-5 mr-2" />
              {tr("landing.i_am_expert")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
