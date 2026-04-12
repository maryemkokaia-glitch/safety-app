"use client";

import { useState } from "react";
import { useDemo } from "@/lib/demo-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, ExternalLink, X, Scale, ArrowRight } from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";
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
  worker_safety: "👷",
  equipment_safety: "⚙️",
  site_safety: "🏗️",
};

const categories: ("all" | RegulationCategory)[] = ["all", "worker_safety", "equipment_safety", "site_safety"];

export function RegulationsView() {
  const { data, t } = useDemo();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | RegulationCategory>("all");

  const filtered = data.regulations.filter((r) => {
    const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === "all" || r.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const grouped = filtered.reduce((acc, reg) => {
    if (!acc[reg.category]) acc[reg.category] = [];
    acc[reg.category].push(reg);
    return acc;
  }, {} as Record<string, Regulation[]>);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("nav.regulations")}</h1>
      <p className="text-sm text-gray-500 mb-5">matsne.gov.ge</p>

      {/* Search + Filter */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder={t("reg.search")} value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[48px]" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2.5 text-xs rounded-xl font-semibold whitespace-nowrap transition-all min-h-[40px] ${
                filterCategory === cat ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {cat === "all" ? t("all") : t(catLabels[cat])}
            </button>
          ))}
        </div>
      </div>

      {/* Regulations — always open, grouped */}
      {filterCategory === "all" ? (
        // Show grouped by category
        Object.entries(grouped).map(([category, regs]) => (
          <div key={category} className="mb-6">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>{catIcons[category as RegulationCategory]}</span>
              {t(catLabels[category as RegulationCategory])}
              <span className="text-gray-300">({regs.length})</span>
            </h2>
            <div className="space-y-2">
              {regs.map((reg) => (
                <RegulationCard key={reg.id} reg={reg} t={t}  />
              ))}
            </div>
          </div>
        ))
      ) : (
        // Show flat list for filtered category
        <div className="space-y-2">
          {filtered.map((reg) => (
            <RegulationCard key={reg.id} reg={reg} t={t}  />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Scale className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">{t("reg.not_found")}</p>
        </div>
      )}

    </div>
  );
}

function RegulationCard({ reg, t }: { reg: Regulation; t: (key: TranslationKey) => string }) {
  // Show first ~120 chars of content as preview
  const preview = reg.content.length > 120 ? reg.content.substring(0, 120) + "..." : reg.content;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug">{reg.title}</h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{preview}</p>
            {reg.source_url && (
              <div className="mt-2.5">
                <a href={reg.source_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors min-h-[32px]">
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
