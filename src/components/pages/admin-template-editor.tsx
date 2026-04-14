"use client";

import { useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useDemo, generateId } from "@/lib/demo-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, AlertTriangle, Shield, Plus, Trash2, Copy, Pencil, X, Check, GripVertical, Ruler, ClipboardCheck, ChevronDown } from "lucide-react";
import { ActionSheet } from "@/components/ui/action-sheet";
import { useDragSort } from "@/lib/hooks/use-drag-sort";
import { measurementUnits } from "@/lib/constants/measurement-units";
import type { TemplateWithItems, ChecklistTemplateItem } from "@/lib/database.types";
import Link from "next/link";

export default function AdminTemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname.startsWith("/inspector") ? "/inspector/templates" : "/admin/templates";
  const { data, updateData, t } = useDemo();
  const [newItemText, setNewItemText] = useState("");
  const [newItemTextEn, setNewItemTextEn] = useState("");
  const [newItemSection, setNewItemSection] = useState<"questionnaire" | "components">("components");
  const [newItemType, setNewItemType] = useState<"check" | "measurement">("check");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [newItemMin, setNewItemMin] = useState("");
  const [newItemMax, setNewItemMax] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameText, setNameText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const template = data.templates.find((t) => t.id === id);
  if (!template) return <div className="text-center py-12 text-gray-500">{t("no_data")}</div>;

  const items = [...template.items].sort((a, b) => a.order_index - b.order_index);

  function updateTemplate(updater: (tmpl: TemplateWithItems) => TemplateWithItems) {
    updateData((d) => ({ ...d, templates: d.templates.map((tmpl) => tmpl.id === id ? updater(tmpl) : tmpl) }));
  }

  const { draggedId, dropTargetId, dropPosition, handlers: dragHandlers } = useDragSort((draggedId, targetId, position) => {
    updateTemplate((tmpl) => {
      const sorted = [...tmpl.items].sort((a, b) => a.order_index - b.order_index);
      const dragIdx = sorted.findIndex((i: ChecklistTemplateItem) => i.id === draggedId);
      if (dragIdx === -1) return tmpl;
      const [dragged] = sorted.splice(dragIdx, 1);
      const newTargetIdx = sorted.findIndex((i: ChecklistTemplateItem) => i.id === targetId);
      if (newTargetIdx === -1) return tmpl;
      const insertIdx = position === "above" ? newTargetIdx : newTargetIdx + 1;
      sorted.splice(insertIdx, 0, dragged);
      return { ...tmpl, items: sorted.map((i, idx) => ({ ...i, order_index: idx + 1 })) };
    });
  });

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemText.trim()) return;
    updateTemplate((tmpl) => ({ ...tmpl, items: [...tmpl.items, {
      id: generateId(), template_id: id, text: newItemText.trim(),
      text_en: newItemTextEn.trim() || null,
      section: newItemSection,
      order_index: tmpl.items.length + 1, is_critical: false,
      input_type: newItemType,
      ...(newItemType === "measurement" ? {
        unit: newItemUnit || undefined,
        norm_min: newItemMin ? parseFloat(newItemMin) : null,
        norm_max: newItemMax ? parseFloat(newItemMax) : null,
      } : {}),
    }] }));
    setNewItemText(""); setNewItemTextEn(""); setNewItemSection("components"); setNewItemType("check"); setNewItemUnit(""); setNewItemMin(""); setNewItemMax("");
  }

  function deleteItem(itemId: string) {
    updateTemplate((tmpl) => ({ ...tmpl, items: tmpl.items.filter((i) => i.id !== itemId).map((i, idx) => ({ ...i, order_index: idx + 1 })) }));
  }

  function toggleCritical(itemId: string) {
    updateTemplate((tmpl) => ({ ...tmpl, items: tmpl.items.map((i: ChecklistTemplateItem) => i.id === itemId ? { ...i, is_critical: !i.is_critical } : i) }));
  }

  function saveItemEdit(itemId: string) {
    if (!editingText.trim()) return;
    updateTemplate((tmpl) => ({ ...tmpl, items: tmpl.items.map((i: ChecklistTemplateItem) => i.id === itemId ? { ...i, text: editingText.trim() } : i) }));
    setEditingItemId(null);
  }

  function saveName() {
    if (!nameText.trim()) return;
    updateTemplate((tmpl) => ({ ...tmpl, name: nameText.trim() }));
    setEditingName(false);
  }

  function duplicateTemplate() {
    const newId = generateId();
    updateData((d) => ({ ...d, templates: [...d.templates, { ...template!, id: newId, name: template!.name + " (ასლი)", items: template!.items.map((i) => ({ ...i, id: generateId(), template_id: newId })), created_at: new Date().toISOString() }] }));
    router.push(`${basePath}/${newId}`);
  }

  function deleteTemplate() {
    updateData((d) => ({ ...d, templates: d.templates.filter((tmpl) => tmpl.id !== id) }));
    router.push(basePath);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={basePath} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> {t("nav.templates")}
      </Link>

      {/* Template header card — Google Forms style */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="h-2 bg-navy-800" />
        <div className="p-5">
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input value={nameText} onChange={(e) => setNameText(e.target.value)} autoFocus
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                className="flex-1 text-xl font-bold border-0 border-b-2 border-navy-800 rounded-none px-0 focus:ring-0 bg-transparent" />
              <Button size="sm" onClick={saveName}><Check className="w-4 h-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}><X className="w-4 h-4" /></Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setEditingName(true); setNameText(template.name); }}>
              <h1 className="text-xl font-bold text-gray-900 flex-1">{template.name}</h1>
              <Pencil className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          <p className="text-sm text-gray-400 mt-2">
            {t("template.checklist_items")}: {items.length}
          </p>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex gap-2 mb-5">
        <Button variant="outline" size="sm" onClick={duplicateTemplate} className="flex-1">
          <Copy className="w-4 h-4 mr-1.5" /> {t("template.duplicate")}
        </Button>
        <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)} className="flex-1">
          <Trash2 className="w-4 h-4 mr-1.5" /> {t("template.delete")}
        </Button>
      </div>

      {/* Items list — Google Forms style cards */}
      <div className="space-y-0">
        {items.map((item, idx) => {
          const isDropTarget = dropTargetId === item.id && draggedId !== item.id;
          const isDragging = draggedId === item.id;

          return (
            <div key={item.id} className="relative">
              {/* Drop indicator line — above */}
              {isDropTarget && dropPosition === "above" && (
                <div className="absolute -top-[2px] left-4 right-4 z-10">
                  <div className="h-[3px] bg-navy-800 rounded-full" />
                  <div className="absolute -left-[5px] -top-[4px] w-[11px] h-[11px] rounded-full bg-navy-800 border-2 border-white" />
                </div>
              )}

              <div
                draggable={editingItemId !== item.id}
                onDragStart={(e) => dragHandlers.onDragStart(e, item.id)}
                onDragEnd={dragHandlers.onDragEnd}
                onDragEnter={(e) => dragHandlers.onDragEnter(e, item.id)}
                onDragLeave={dragHandlers.onDragLeave}
                onDragOver={(e) => dragHandlers.onDragOver(e, item.id)}
                onDrop={(e) => dragHandlers.onDrop(e, item.id)}
                className={`
                  bg-white rounded-lg border border-gray-200 shadow-sm my-2
                  transition-all duration-150 cursor-grab active:cursor-grabbing
                  ${isDragging ? "opacity-40 scale-[0.98]" : "hover:shadow-md hover:border-gray-300"}
                  ${isDropTarget ? "border-navy-300" : ""}
                  overflow-hidden
                `}
              >
                <div className="flex">
                  {/* Left accent bar */}
                  <div className={`w-1.5 shrink-0 ${item.is_critical ? "bg-red-500" : "bg-navy-800"}`} />

                  <div className="flex-1 min-w-0">
                    {editingItemId === item.id ? (
                      <div className="p-4 flex items-center gap-2">
                        <Input value={editingText} onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveItemEdit(item.id); if (e.key === "Escape") setEditingItemId(null); }}
                          autoFocus className="flex-1" />
                        <Button size="sm" onClick={() => saveItemEdit(item.id)}><Check className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingItemId(null)}><X className="w-4 h-4" /></Button>
                      </div>
                    ) : (
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Drag handle */}
                          <div className="mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0">
                            <GripVertical className="w-5 h-5" />
                          </div>

                          {/* Number */}
                          <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>

                          {/* Text — click to edit */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 leading-relaxed cursor-text hover:text-navy-800 transition-colors"
                              onClick={(e) => { e.stopPropagation(); setEditingItemId(item.id); setEditingText(item.text); }}>
                              {item.text}
                            </p>
                            {/* Measurement badge */}
                            {item.input_type === "measurement" && (
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-200">
                                  <Ruler className="w-3 h-3" /> {t("template.type_measurement")}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {t("template.norm")}: {item.norm_min != null && item.norm_max != null ? `${item.norm_min}–${item.norm_max}` : item.norm_min != null ? `≥${item.norm_min}` : item.norm_max != null ? `≤${item.norm_max}` : ""} {item.unit || ""}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 mt-3 ml-[60px]">
                          <button onClick={() => toggleCritical(item.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                              ${item.is_critical
                                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                : "bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100 hover:text-gray-600"}`}>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {t("template.mark_critical")}
                          </button>
                          <div className="flex-1" />
                          <button onClick={() => deleteItem(item.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Drop indicator line — below (only for last item) */}
              {isDropTarget && dropPosition === "below" && idx === items.length - 1 && (
                <div className="absolute -bottom-[2px] left-4 right-4 z-10">
                  <div className="h-[3px] bg-navy-800 rounded-full" />
                  <div className="absolute -left-[5px] -top-[4px] w-[11px] h-[11px] rounded-full bg-navy-800 border-2 border-white" />
                </div>
              )}
            </div>
          );
        })}

        {items.length === 0 && (
          <EmptyState icon={Shield} title={t("no_data")} className="border-2 border-dashed" />
        )}
      </div>

      {/* Add item — Google Forms style */}
      <form onSubmit={addItem} className="mt-4 mb-8">
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-navy-400 transition-colors p-4 space-y-3">
          {/* Type + Section toggles */}
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={() => setNewItemType("check")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${newItemType === "check" ? "bg-navy-800 text-white" : "bg-gray-100 text-gray-500"}`}>
              <ClipboardCheck className="w-3.5 h-3.5" /> {t("template.type_check")}
            </button>
            <button type="button" onClick={() => setNewItemType("measurement")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${newItemType === "measurement" ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-500"}`}>
              <Ruler className="w-3.5 h-3.5" /> {t("template.type_measurement")}
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
            <button type="button" onClick={() => setNewItemSection("questionnaire")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${newItemSection === "questionnaire" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>
              {t("inspection.section_questionnaire")}
            </button>
            <button type="button" onClick={() => setNewItemSection("components")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${newItemSection === "components" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>
              {t("inspection.section_components")}
            </button>
          </div>

          {/* Item text (Georgian) */}
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-gray-400 shrink-0" />
            <input value={newItemText} onChange={(e) => setNewItemText(e.target.value)}
              placeholder={t("template.item_placeholder")}
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400 min-h-[44px]" />
          </div>

          {/* Item text (English — optional) */}
          <div className="flex items-center gap-3 pl-8">
            <input value={newItemTextEn} onChange={(e) => setNewItemTextEn(e.target.value)}
              placeholder="English name (optional)"
              className="flex-1 text-xs bg-transparent outline-none placeholder:text-gray-300 min-h-[32px] text-gray-500 border-b border-dashed border-gray-200 focus:border-navy-400" />
          </div>

          {/* Measurement fields */}
          {newItemType === "measurement" && (
            <div className="space-y-2 pl-8">
              {/* Unit picker trigger */}
              <button type="button" onClick={() => setShowUnitPicker(true)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-violet-200 bg-violet-50/50 text-sm min-h-[48px] hover:border-violet-300 transition-colors">
                {newItemUnit ? (
                  <span className="font-medium text-violet-700">
                    {measurementUnits.find(u => u.value === newItemUnit)?.icon} {measurementUnits.find(u => u.value === newItemUnit)?.label || newItemUnit}
                  </span>
                ) : (
                  <span className="text-gray-400">{t("template.unit")} — აირჩიეთ</span>
                )}
                <ChevronDown className="w-4 h-4 text-violet-400" />
              </button>
              {/* Min / Max */}
              <div className="grid grid-cols-2 gap-2">
                <input value={newItemMin} onChange={(e) => setNewItemMin(e.target.value)}
                  placeholder={`${t("template.norm_min")} ↓`} type="number" step="any"
                  className="text-sm border border-gray-300 rounded-xl px-3 py-3 bg-white outline-none focus:border-violet-500 min-h-[48px]" />
                <input value={newItemMax} onChange={(e) => setNewItemMax(e.target.value)}
                  placeholder={`${t("template.norm_max")} ↑`} type="number" step="any"
                  className="text-sm border border-gray-300 rounded-xl px-3 py-3 bg-white outline-none focus:border-violet-500 min-h-[48px]" />
              </div>
            </div>
          )}

          {newItemText.trim() && (
            <div className="pl-8">
              <Button type="submit" size="sm">{t("template.add_item")}</Button>
            </div>
          )}
        </div>
      </form>

      {/* Delete confirm */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title={t("template.delete")}>
        <p className="text-sm text-gray-600 mb-5">{t("template.delete_confirm")}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} className="flex-1">{t("confirm.no")}</Button>
          <Button variant="danger" onClick={deleteTemplate} className="flex-1">{t("confirm.yes")}</Button>
        </div>
      </Modal>

      {/* Unit picker action sheet */}
      <ActionSheet
        open={showUnitPicker}
        onClose={() => setShowUnitPicker(false)}
        title={t("template.unit")}
        options={measurementUnits}
        value={newItemUnit}
        onChange={setNewItemUnit}
      />
    </div>
  );
}
