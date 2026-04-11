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
  const [selectedReg, setSelectedReg] = useState<Regulation | null>(null);

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
                <RegulationCard key={reg.id} reg={reg} t={t} onOpen={() => setSelectedReg(reg)} />
              ))}
            </div>
          </div>
        ))
      ) : (
        // Show flat list for filtered category
        <div className="space-y-2">
          {filtered.map((reg) => (
            <RegulationCard key={reg.id} reg={reg} t={t} onOpen={() => setSelectedReg(reg)} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Scale className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">{t("reg.not_found")}</p>
        </div>
      )}

      {/* Full-page regulation popup */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-10">
            <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
              <button onClick={() => setSelectedReg(null)}
                className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2">
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex-1 min-w-0">
                <Badge variant={catVariants[selectedReg.category]} className="mb-0.5">
                  {t(catLabels[selectedReg.category])}
                </Badge>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5 text-blue-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{selectedReg.title}</h1>
            </div>

            {/* Meta info */}
            {(selectedReg.effective_date || selectedReg.source_url) && (
              <div className="flex flex-wrap gap-3 mb-6">
                {selectedReg.effective_date && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                    {new Date(selectedReg.effective_date).toLocaleDateString("ka-GE")}
                  </span>
                )}
                {selectedReg.source_url && (
                  <a href={selectedReg.source_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-100">
                    <ExternalLink className="w-3 h-3" /> matsne.gov.ge
                  </a>
                )}
              </div>
            )}

            {/* Full text */}
            <div className="prose prose-sm max-w-none">
              <p className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-line">
                {selectedReg.content}
              </p>
            </div>

            {/* Tags */}
            {selectedReg.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedReg.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Source link at bottom */}
            {selectedReg.source_url && (
              <div className="mt-8">
                <a href={selectedReg.source_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors min-h-[48px]">
                  <ExternalLink className="w-4 h-4" /> matsne.gov.ge — სრული ტექსტი
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RegulationCard({ reg, t, onOpen }: { reg: Regulation; t: (key: TranslationKey) => string; onOpen: () => void }) {
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
            <div className="flex items-center gap-2 mt-2.5">
              <button onClick={onOpen}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 active:scale-95 transition-all min-h-[32px]">
                სრულად <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
