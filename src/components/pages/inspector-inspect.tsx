"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDemo, generateId } from "@/lib/demo-context";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScoreBadge } from "@/components/ui/score-badge";
import { InspectionItemRow } from "@/components/inspection-item-row";
import { Send, ArrowLeft, ArrowDown } from "lucide-react";
import { calculateSafetyScore, getScoreLabel, getStatusFromMeasurement } from "@/lib/utils/safety-score";
import { compressImage } from "@/lib/utils/image";
import type { ChecklistItemStatus } from "@/lib/database.types";

export default function InspectorInspect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, updateData, t } = useDemo();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [detailedDescription, setDetailedDescription] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [sendToClient, setSendToClient] = useState(true);

  const inspection = data.inspections.find((i) => i.id === id);
  if (!inspection) return <div className="text-center py-12 text-gray-500">{t("no_data")}</div>;

  const project = data.projects.find((p) => p.id === inspection.project_id);
  const template = data.templates.find((t) => t.id === inspection.template_id);
  const items = inspection.items;
  const clientEmails = (project as any)?.client_emails as string[] || [];

  const statusLabels = useMemo(() => ({
    safe: t("inspection.safe"),
    violation: t("inspection.violation"),
    not_applicable: t("inspection.na"),
    comment: t("inspection.comment"),
    photo: t("inspection.add_photo"),
  }), [t]);

  const { score, completedCount, progressPercent, violationCount } = useMemo(() => {
    const s = calculateSafetyScore(items);
    const completed = items.filter((i) => i.status !== "not_applicable").length;
    return {
      score: s,
      completedCount: completed,
      progressPercent: items.length > 0 ? (completed / items.length) * 100 : 0,
      violationCount: items.filter((i) => i.status === "violation").length,
    };
  }, [items]);

  // Group items by section (questionnaire first, then components)
  const sections = useMemo(() => {
    const questionnaire = items.filter((i) => i.template_item?.section === "questionnaire");
    const components = items.filter((i) => (i.template_item?.section ?? "components") === "components");
    return [
      { key: "questionnaire" as const, items: questionnaire },
      { key: "components" as const, items: components },
    ].filter((s) => s.items.length > 0);
  }, [items]);

  const updateItemStatus = useCallback((itemId: string, status: ChecklistItemStatus) => {
    updateData((d) => ({ ...d, inspections: d.inspections.map((insp) => insp.id === id ? { ...insp, items: insp.items.map((item) => item.id === itemId ? { ...item, status } : item) } : insp) }));
  }, [updateData, id]);

  const updateItemComment = useCallback((itemId: string, comment: string) => {
    updateData((d) => ({ ...d, inspections: d.inspections.map((insp) => insp.id === id ? { ...insp, items: insp.items.map((item) => item.id === itemId ? { ...item, comment: comment || null } : item) } : insp) }));
  }, [updateData, id]);

  const updateMeasuredValue = useCallback((itemId: string, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    const item = items.find((i) => i.id === itemId);
    const tmplItem = item?.template_item;
    const autoStatus = getStatusFromMeasurement(numValue, tmplItem?.norm_min, tmplItem?.norm_max);
    updateData((d) => ({ ...d, inspections: d.inspections.map((insp) => insp.id === id ? { ...insp, items: insp.items.map((it) => it.id === itemId ? { ...it, measured_value: numValue, status: autoStatus } : it) } : insp) }));
  }, [updateData, id, items]);

  const addItemPhoto = useCallback(async (itemId: string, file: File) => {
    const dataUrl = await compressImage(file);
    const photo = { id: generateId(), inspection_item_id: itemId, photo_url: dataUrl, caption: null, taken_at: new Date().toISOString() };
    updateData((d) => ({ ...d, inspections: d.inspections.map((insp) => insp.id === id ? { ...insp, items: insp.items.map((item) => item.id === itemId ? { ...item, photos: [...(item.photos || []), photo] } : item) } : insp) }));
  }, [updateData, id]);

  const removeItemPhoto = useCallback((itemId: string, photoId: string) => {
    updateData((d) => ({ ...d, inspections: d.inspections.map((insp) => insp.id === id ? { ...insp, items: insp.items.map((item) => item.id === itemId ? { ...item, photos: (item.photos || []).filter((p) => p.id !== photoId) } : item) } : insp) }));
  }, [updateData, id]);

  const toggleExpand = useCallback((itemId: string) => {
    setExpandedItem((prev) => prev === itemId ? null : itemId);
  }, []);

  function submitInspection() {
    const finalScore = calculateSafetyScore(items);
    updateData((d) => ({
      ...d,
      inspections: d.inspections.map((insp) =>
        insp.id === id
          ? { ...insp, status: "completed", safety_score: finalScore, notes: conclusion || null, detailed_description: detailedDescription || null, completed_at: new Date().toISOString() }
          : insp
      ),
    }));

    if (sendToClient && clientEmails.length > 0) {
      const subject = encodeURIComponent(`${t("inspection.finish")} — ${project?.name} — ${finalScore}%`);
      const body = encodeURIComponent(
        `${project?.name}\n${template?.name}\n\n${t("inspection.score")}: ${finalScore}%\n${t("inspection.violation")}: ${violationCount}\n\n${t("inspection.detailed_description")}:\n${detailedDescription || "—"}\n\n${t("inspection.conclusion")}:\n${conclusion || "—"}\n\n— Sarke`
      );
      window.open(`mailto:${clientEmails.join(",")}?subject=${subject}&body=${body}`, "_blank");
    }

    router.push("/inspector");
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Sticky header + progress */}
      <div className="sticky top-12 lg:top-0 z-10 bg-gray-50 pb-3 -mx-4 px-4 pt-1">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => router.push(`/inspector/project/${inspection.project_id}`)} aria-label="Back"
            className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-gray-900 truncate">{template?.name}</h1>
            <p className="text-[11px] text-gray-400 truncate">{project?.name}</p>
          </div>
          <ScoreBadge score={score} />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-navy-800 rounded-full transition-[width] duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="text-[10px] text-gray-400 font-medium shrink-0">{completedCount}/{items.length}</span>
        </div>
      </div>

      {/* Checklist items — grouped by section */}
      {sections.map((section) => (
        <div key={section.key} className="mb-4">
          {sections.length > 1 && (
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
              {section.key === "questionnaire" ? t("inspection.section_questionnaire") : t("inspection.section_components")}
            </h2>
          )}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-200">
            {section.items.map((item, idx) => (
              <InspectionItemRow
                key={item.id}
                item={item}
                idx={idx}
                isExpanded={expandedItem === item.id}
                statusLabels={statusLabels}
                onToggleExpand={toggleExpand}
                onStatusChange={updateItemStatus}
                onCommentChange={updateItemComment}
                onMeasuredValueChange={updateMeasuredValue}
                onAddPhoto={addItemPhoto}
                onRemovePhoto={removeItemPhoto}
                commentPlaceholder={t("inspection.comment") + "..."}
                enterValuePlaceholder={t("inspection.enter_value")}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Detailed description + Conclusion */}
      <Card className="mb-4">
        <CardContent>
          <div className="space-y-4">
            <Textarea
              label={t("inspection.detailed_description")}
              placeholder={t("inspection.detailed_description_placeholder")}
              value={detailedDescription}
              onChange={(e) => setDetailedDescription(e.target.value)}
              rows={4}
            />
            <Textarea
              label={t("inspection.conclusion")}
              placeholder={t("inspection.conclusion_placeholder")}
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Spacer for fixed button */}
      <div className="h-24" />

      {/* Submit button */}
      <div className="fixed bottom-16 left-0 right-0 z-20 px-4 pb-2 lg:pl-68">
        <div className="max-w-xl mx-auto relative">
          {/* Next-unanswered floating hint */}
          {completedCount < items.length && (
            <button
              onClick={() => {
                const next = items.find((i) => i.status === "not_applicable");
                if (next) {
                  const el = document.getElementById(`insp-item-${next.id}`);
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              className="absolute -top-12 right-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-blue-200 text-blue-700 text-xs font-semibold shadow-md hover:bg-blue-50 active:scale-95 transition-all"
              aria-label="Next unanswered"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              შემდეგი ({items.length - completedCount})
            </button>
          )}
          <Button onClick={() => setShowConfirm(true)} size="lg" className="w-full text-base shadow-lg shadow-navy-800/20">
            <Send className="w-5 h-5 mr-2" />
            {t("inspection.finish")} — {score}% {getScoreLabel(score)}
          </Button>
          <p className="text-center text-xs text-gray-400 mt-1.5 bg-gray-50/80">
            {violationCount} {t("inspection.violation")} · {completedCount}/{items.length}
          </p>
        </div>
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm relative z-10">
            <div className="flex justify-center mb-4">
              <ScoreBadge score={score} size="lg" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">{t("inspection.confirm_submit")}</h3>
            <p className="text-sm text-gray-500 text-center mb-4">{t("inspection.confirm_submit_desc")}</p>

            {clientEmails.length > 0 && (
              <button
                onClick={() => setSendToClient(!sendToClient)}
                className={cn(
                  "w-full flex items-center gap-3 p-3.5 rounded-xl mb-4 transition-colors text-left",
                  sendToClient ? "bg-orange-50 border border-navy-200" : "bg-gray-50 border border-gray-200"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                  sendToClient ? "bg-navy-800 border-navy-800" : "border-gray-300"
                )}>
                  {sendToClient && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{t("inspection.send_to_client")}</p>
                  <p className="text-xs text-gray-500 truncate">{clientEmails.join(", ")}</p>
                </div>
              </button>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 min-h-[48px]">
                {t("cancel")}
              </button>
              <button onClick={submitInspection}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-navy-800 min-h-[48px] flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                {t("inspection.finish")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
