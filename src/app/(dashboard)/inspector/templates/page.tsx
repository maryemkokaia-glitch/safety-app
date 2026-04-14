"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDemo, generateId } from "@/lib/demo-context";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { ClipboardList, ChevronRight, Plus, Search } from "lucide-react";
import Link from "next/link";
import type { ChecklistCategory } from "@/lib/database.types";
import type { TranslationKey } from "@/lib/i18n";

const catLabels: Record<ChecklistCategory, TranslationKey> = {
  scaffold_fixed: "cat.scaffold_fixed",
  scaffold_mobile: "cat.scaffold_mobile",
  scaffold_suspended: "cat.scaffold_suspended",
  harness_ppe: "cat.harness_ppe",
  equipment: "cat.equipment",
  ppe_general: "cat.ppe_general",
  physical_factors: "cat.physical_factors",
};

const catIcons: Record<ChecklistCategory, string> = {
  scaffold_fixed: "🏗️",
  scaffold_mobile: "🚧",
  scaffold_suspended: "⛓️",
  harness_ppe: "🦺",
  equipment: "⚙️",
  ppe_general: "👷",
  physical_factors: "🌡️",
};

export default function InspectorTemplatesPage() {
  const { data, updateData, t } = useDemo();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ChecklistCategory>("scaffold_fixed");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return data.templates;
    const q = query.toLowerCase();
    return data.templates.filter((t) => t.name.toLowerCase().includes(q));
  }, [data.templates, query]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const newId = generateId();
    updateData((d) => ({
      ...d,
      templates: [
        ...d.templates,
        {
          id: newId,
          name,
          category,
          company_id: null,
          created_at: new Date().toISOString(),
          items: [],
        },
      ],
    }));
    setShowModal(false);
    setName("");
    router.push(`/inspector/templates/${newId}`);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">{t("template.title")}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{data.templates.length} შაბლონი</p>
      </div>

      {/* Search + Add */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 min-h-[44px]"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition-colors shrink-0 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          ახალი
        </button>
      </div>

      {/* Tight list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
          <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">
            {data.templates.length === 0 ? t("no_data") : "ვერაფერი მოიძებნა"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {filtered.map((template) => (
            <Link
              key={template.id}
              href={`/inspector/templates/${template.id}`}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 text-xl">
                {catIcons[template.category]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                  {template.name}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {t(catLabels[template.category])} · {template.items.length} {t("template.items")}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </Link>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={t("template.new")}>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            id="name"
            label={t("template.name_placeholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <Select
            id="category"
            label={t("template.category")}
            value={category}
            onChange={(e) => setCategory(e.target.value as ChecklistCategory)}
            options={Object.entries(catLabels).map(([value, key]) => ({
              value,
              label: t(key as TranslationKey),
            }))}
          />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 min-h-[48px]"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 min-h-[48px]"
            >
              {t("create")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
