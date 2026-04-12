"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo, generateId } from "@/lib/demo-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { ClipboardList, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import type { ChecklistCategory } from "@/lib/database.types";
import type { TranslationKey } from "@/lib/i18n";

const catLabels: Record<ChecklistCategory, TranslationKey> = { scaffold_fixed: "cat.scaffold_fixed", scaffold_mobile: "cat.scaffold_mobile", scaffold_suspended: "cat.scaffold_suspended", harness_ppe: "cat.harness_ppe", equipment: "cat.equipment", ppe_general: "cat.ppe_general", physical_factors: "cat.physical_factors" };

export default function InspectorTemplatesPage() {
  const { data, updateData, t } = useDemo();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ChecklistCategory>("scaffold_fixed");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const newId = generateId();
    updateData((d) => ({
      ...d,
      templates: [...d.templates, {
        id: newId, name, category, company_id: null,
        created_at: new Date().toISOString(), items: [],
      }],
    }));
    setShowModal(false);
    setName("");
    router.push(`/inspector/templates/${newId}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("template.title")}</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> {t("template.new")}
        </Button>
      </div>

      {data.templates.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 mb-4">{t("no_data")}</p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> {t("template.new")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.templates.map((template) => (
            <Link key={template.id} href={`/inspector/templates/${template.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg mt-0.5"><ClipboardList className="w-5 h-5 text-navy-800" /></div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{template.name}</h3>
                        <Badge variant="info" className="mt-1">{t(catLabels[template.category])}</Badge>
                        <p className="text-xs text-gray-500 mt-2">{template.items.length} {t("template.items")}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={t("template.new")}>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input id="name" label={t("template.name_placeholder")} value={name} onChange={(e) => setName(e.target.value)} required />
          <Select id="category" label={t("template.category")} value={category} onChange={(e) => setCategory(e.target.value as ChecklistCategory)}
            options={Object.entries(catLabels).map(([value, key]) => ({ value, label: t(key) }))} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">{t("cancel")}</Button>
            <Button type="submit" className="flex-1">{t("create")}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
