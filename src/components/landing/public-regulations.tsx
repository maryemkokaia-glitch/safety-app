"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, ExternalLink, Scale, ChevronDown, ChevronUp } from "lucide-react";
import { t, type Lang, type TranslationKey } from "@/lib/i18n";
import type { Regulation, RegulationCategory } from "@/lib/database.types";

const catLabels: Record<RegulationCategory, TranslationKey> = {
  worker_safety: "reg.worker_safety",
  equipment_safety: "reg.equipment_safety",
  site_safety: "reg.site_safety",
};

const catVariants: Record<RegulationCategory, "info" | "success" | "warning"> = {
  worker_safety: "info",
  equipment_safety: "success",
  site_safety: "warning",
};

const catIcons: Record<RegulationCategory, string> = {
  worker_safety: "\u{1F477}",
  equipment_safety: "\u{2699}\u{FE0F}",
  site_safety: "\u{1F3D7}\u{FE0F}",
};

const categories: ("all" | RegulationCategory)[] = ["all", "worker_safety", "equipment_safety", "site_safety"];

const INITIAL_COUNT = 6;

interface PublicRegulationsProps {
  regulations: Regulation[];
  lang: Lang;
}

export function PublicRegulations({ regulations, lang }: PublicRegulationsProps) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | RegulationCategory>("all");
  const [showAll, setShowAll] = useState(false);
  const tr = (key: TranslationKey) => t(key, lang);

  const filtered = regulations.filter((r) => {
    const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === "all" || r.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const displayed = showAll ? filtered : filtered.slice(0, INITIAL_COUNT);
  const hasMore = filtered.length > INITIAL_COUNT;

  // Group by category when "all" is selected
  const grouped = displayed.reduce((acc, reg) => {
    if (!acc[reg.category]) acc[reg.category] = [];
    acc[reg.category].push(reg);
    return acc;
  }, {} as Record<string, Regulation[]>);

  return (
    <section className="py-12 lg:py-20 px-5" id="regulations">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {tr("landing.public_regs_title")}
          </h2>
          <p className="text-sm text-gray-500">{tr("landing.public_regs_subtitle")}</p>
        </div>

        {/* Search + Filter */}
        <div className="space-y-3 mb-6 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={tr("reg.search")}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowAll(true); }}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[48px] bg-white"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2.5 text-xs rounded-xl font-semibold whitespace-nowrap transition-all min-h-[40px] ${
                  filterCategory === cat ? "bg-navy-800 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat === "all" ? tr("all") : tr(catLabels[cat])}
              </button>
            ))}
          </div>
        </div>

        {/* Regulation Cards */}
        {filterCategory === "all" ? (
          Object.entries(grouped).map(([category, regs]) => (
            <div key={category} className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>{catIcons[category as RegulationCategory]}</span>
                {tr(catLabels[category as RegulationCategory])}
                <span className="text-gray-300">({regs.length})</span>
              </h3>
              <div className="space-y-2">
                {regs.map((reg) => (
                  <RegulationCard key={reg.id} reg={reg} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-2">
            {displayed.map((reg) => (
              <RegulationCard key={reg.id} reg={reg} />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Scale className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">{tr("reg.not_found")}</p>
          </div>
        )}

        {/* View All / Show Less toggle */}
        {hasMore && !search && (
          <div className="text-center mt-6">
            <Button variant="outline" onClick={() => setShowAll(!showAll)}>
              {showAll ? (
                <><ChevronUp className="w-4 h-4 mr-1.5" /> {tr("landing.show_less")}</>
              ) : (
                <><ChevronDown className="w-4 h-4 mr-1.5" /> {tr("landing.view_all_regs")} ({filtered.length})</>
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function RegulationCard({ reg }: { reg: Regulation }) {
  const preview = reg.content.length > 120 ? reg.content.substring(0, 120) + "..." : reg.content;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen className="w-4 h-4 text-navy-800" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug">{reg.title}</h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{preview}</p>
            {reg.source_url && (
              <div className="mt-2.5">
                <a
                  href={reg.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-navy-800 hover:text-navy-900 transition-colors min-h-[32px]"
                >
                  <ExternalLink className="w-3 h-3" /> matsne.gov.ge
                </a>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
