"use client";



import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDemo, generateId } from "@/lib/demo-context";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, AlertTriangle, XCircle, MinusCircle, Send, ArrowLeft, MessageSquare, ChevronDown, Camera, X, Image, Ruler } from "lucide-react";
import { calculateSafetyScore, getScoreBgColor, getScoreLabel, getStatusFromMeasurement, formatNormRange } from "@/lib/utils/safety-score";
import type { ChecklistItemStatus } from "@/lib/database.types";

export default function InspectorInspect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, updateData, t } = useDemo();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);

  const inspection = data.inspections.find((i) => i.id === id);
  if (!inspection) return <div className="text-center py-12 text-gray-500">{t("no_data")}</div>;

  const project = data.projects.find((p) => p.id === inspection.project_id);
  const template = data.templates.find((t) => t.id === inspection.template_id);
  const items = inspection.items;

  const statusButtons: { status: ChecklistItemStatus; icon: typeof CheckCircle; label: string; bg: string; ring: string; activeBg: string }[] = [
    { status: "safe", icon: CheckCircle, label: t("inspection.safe"), bg: "bg-green-500", ring: "ring-green-400", activeBg: "bg-green-50 border-green-300" },
    { status: "warning", icon: AlertTriangle, label: t("inspection.warning"), bg: "bg-amber-500", ring: "ring-amber-400", activeBg: "bg-amber-50 border-amber-300" },
    { status: "violation", icon: XCircle, label: t("inspection.violation"), bg: "bg-red-500", ring: "ring-red-400", activeBg: "bg-red-50 border-red-300" },
    { status: "not_applicable", icon: MinusCircle, label: "N/A", bg: "bg-gray-400", ring: "ring-gray-300", activeBg: "bg-gray-50 border-gray-300" },
  ];

  function updateItemStatus(itemId: string, status: ChecklistItemStatus) {
    updateData((d) => ({ ...d, inspections: d.inspections.map((insp) => insp.id === id ? { ...insp, items: insp.items.map((item) => item.id === itemId ? { ...item, status } : item) } : insp) }));
  }
  function updateItemComment(itemId: string, comment: string) {
    updateData((d) => ({ ...d, inspections: d.inspections.map((insp) => insp.id === id ? { ...insp, items: insp.items.map((item) => item.id === itemId ? { ...item, comment: comment || null } : item) } : insp) }));
  }
  function updateMeasuredValue(itemId: string, value: string) {
    const numValue = value === "" ? null : parseFloat(value);
    const item = items.find((i) => i.id === itemId);
    const tmplItem = item?.template_item;
    const autoStatus = getStatusFromMeasurement(numValue, tmplItem?.norm_min, tmplItem?.norm_max);
    updateData((d) => ({ ...d, inspections: d.inspections.map((insp) => insp.id === id ? { ...insp, items: insp.items.map((it) => it.id === itemId ? { ...it, measured_value: numValue, status: autoStatus } : it) } : insp) }));
  }
  function addItemPhoto(itemId: string, file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;
      const photo = { id: generateId(), inspection_item_id: itemId, photo_url: dataUrl, caption: null, taken_at: new Date().toISOString() };
      updateData((d) => ({ ...d, inspections: d.inspections.map((insp) => insp.id === id ? { ...insp, items: insp.items.map((item) => item.id === itemId ? { ...item, photos: [...(item.photos || []), photo] } : item) } : insp) }));
    };
    reader.readAsDataURL(file);
  }
  function removeItemPhoto(itemId: string, photoId: string) {
    updateData((d) => ({ ...d, inspections: d.inspections.map((insp) => insp.id === id ? { ...insp, items: insp.items.map((item) => item.id === itemId ? { ...item, photos: (item.photos || []).filter((p) => p.id !== photoId) } : item) } : insp) }));
  }
  const [showConfirm, setShowConfirm] = useState(false);

  function submitInspection() {
    const score = calculateSafetyScore(items);
    updateData((d) => ({ ...d, inspections: d.inspections.map((insp) => insp.id === id ? { ...insp, status: "completed", safety_score: score, notes: notes || null, completed_at: new Date().toISOString() } : insp) }));
    router.push("/inspector");
  }
  function updatePhotoCaption(itemId: string, photoId: string, caption: string) {
    updateData((d) => ({ ...d, inspections: d.inspections.map((insp) => insp.id === id ? { ...insp, items: insp.items.map((item) => item.id === itemId ? { ...item, photos: (item.photos || []).map((p) => p.id === photoId ? { ...p, caption: caption || null } : p) } : item) } : insp) }));
  }

  const score = calculateSafetyScore(items);
  const completedCount = items.filter((i) => i.status !== "not_applicable").length;
  const progressPercent = items.length > 0 ? (completedCount / items.length) * 100 : 0;

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
          <Badge className={cn(getScoreBgColor(score), "text-sm px-3 py-1 font-bold")}>{score}%</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="text-[10px] text-gray-400 font-medium shrink-0">{completedCount}/{items.length}</span>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-3 mb-4">
        {items.map((item, idx) => {
          const isExpanded = expandedItem === item.id;
          const currentStatus = statusButtons.find((s) => s.status === item.status);
          return (
            <div key={item.id}
              className={cn(
                "bg-white rounded-2xl border shadow-sm overflow-hidden transition-all",
                item.status === "violation" ? "border-red-200 bg-red-50/30" :
                item.status === "warning" ? "border-amber-200 bg-amber-50/30" :
                item.status === "safe" ? "border-green-200 bg-green-50/30" :
                "border-gray-200/80"
              )}>
              {/* Question + status buttons — compact */}
              <div className="px-4 py-3">
                {/* Question text */}
                <div className="flex items-start gap-2 mb-2.5">
                  <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-900 leading-snug">{item.template_item?.text}</p>
                    {item.is_critical && <span className="text-[10px] text-red-600 font-bold">{t("inspection.critical")}</span>}
                  </div>
                </div>

                {item.template_item?.input_type === "measurement" ? (
                  /* Measurement — compact row */
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number" step="any" inputMode="decimal"
                          value={item.measured_value ?? ""}
                          onChange={(e) => updateMeasuredValue(item.id, e.target.value)}
                          placeholder={t("inspection.enter_value")}
                          className={cn(
                            "w-full rounded-lg border-2 px-3 py-2 text-base font-bold text-center min-h-[44px] outline-none transition-all",
                            item.status === "safe" ? "border-green-300 bg-green-50 text-green-700" :
                            item.status === "warning" ? "border-amber-300 bg-amber-50 text-amber-700" :
                            item.status === "violation" ? "border-red-300 bg-red-50 text-red-700" :
                            "border-gray-200 bg-gray-50 text-gray-600"
                          )}
                        />
                        {item.template_item?.unit && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">{item.template_item.unit}</span>
                        )}
                      </div>
                      {item.measured_value != null && (
                        <Badge variant={item.status === "safe" ? "success" : item.status === "warning" ? "warning" : item.status === "violation" ? "danger" : "default"} className="shrink-0 text-[10px]">
                          {item.status === "safe" ? "✓" : item.status === "warning" ? "⚠" : item.status === "violation" ? "✗" : "—"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <Ruler className="w-2.5 h-2.5" />
                      {formatNormRange(item.template_item?.norm_min, item.template_item?.norm_max, item.template_item?.unit)}
                    </p>
                  </div>
                ) : (
                  /* Status buttons — single row, icon-only on mobile */
                  <div className="flex gap-1.5">
                    {statusButtons.map(({ status, icon: Icon, label, activeBg }) => {
                      const isActive = item.status === status;
                      return (
                        <button key={status} onClick={() => updateItemStatus(item.id, status)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-semibold transition-all border min-h-[36px]",
                            isActive ? `${activeBg} text-gray-900` : "bg-gray-50 border-transparent text-gray-400 active:scale-95"
                          )}>
                          <Icon className={cn("w-3.5 h-3.5", isActive && (status === "safe" ? "text-green-600" : status === "warning" ? "text-amber-600" : status === "violation" ? "text-red-600" : "text-gray-500"))} />
                          <span className="hidden sm:inline">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions row: comment + photo — compact */}
              <div className="flex items-center border-t border-gray-100 px-2">
                <button onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                  className={cn("flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors min-h-[36px]",
                    item.comment ? "text-blue-600" : "text-gray-400"
                  )}>
                  <MessageSquare className="w-3.5 h-3.5" />
                  {item.comment ? "✓" : t("inspection.comment")}
                </button>
                <div className="w-px h-4 bg-gray-100" />
                <label className={cn("flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-medium cursor-pointer transition-colors min-h-[36px]",
                  (item.photos?.length ?? 0) > 0 ? "text-blue-600" : "text-gray-400"
                )}>
                  <Camera className="w-3.5 h-3.5" />
                  {(item.photos?.length ?? 0) > 0 ? `${item.photos!.length}` : t("inspection.add_photo")}
                  <input type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) addItemPhoto(item.id, f); e.target.value = ""; }} />
                </label>
              </div>

              {/* Comment expand */}
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-gray-100 bg-gray-50/50 pt-2">
                  <Textarea placeholder={t("inspection.comment") + "..."} value={item.comment || ""}
                    onChange={(e) => updateItemComment(item.id, e.target.value)} autoFocus rows={2} />
                </div>
              )}

              {/* Photo strip */}
              {(item.photos?.length ?? 0) > 0 && (
                <div className="px-3 pb-2 border-t border-gray-100 pt-2">
                  <div className="flex gap-1.5 overflow-x-auto">
                    {item.photos!.map((photo) => (
                      <div key={photo.id} className="relative shrink-0">
                        <img src={photo.photo_url} alt="" className="w-12 h-12 object-cover rounded-lg" loading="lazy" />
                        <button onClick={() => removeItemPhoto(item.id, photo.id)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notes */}
      <Card className="mb-4">
        <CardContent>
          <Textarea label={t("inspection.notes")} placeholder={t("inspection.notes_placeholder")}
            value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </CardContent>
      </Card>

      {/* Spacer for fixed button */}
      <div className="h-24" />

      {/* Submit button — fixed at bottom */}
      <div className="fixed bottom-16 left-0 right-0 z-20 px-4 pb-2 lg:pl-68">
        <div className="max-w-xl mx-auto">
          <Button onClick={() => setShowConfirm(true)} size="lg" className="w-full text-base shadow-lg shadow-blue-600/20">
            <Send className="w-5 h-5 mr-2" />
            {t("inspection.finish")} — {score}% {getScoreLabel(score)}
          </Button>
          <p className="text-center text-xs text-gray-400 mt-1.5 bg-gray-50/80">
            {items.filter((i) => i.status === "violation").length} {t("inspection.violation")} · {items.filter((i) => i.status === "warning").length} {t("inspection.warning")}
          </p>
        </div>
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm relative z-10">
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
              score >= 80 ? "bg-green-100" : score >= 50 ? "bg-amber-100" : "bg-red-100"
            )}>
              <span className={cn("text-2xl font-black",
                score >= 80 ? "text-green-700" : score >= 50 ? "text-amber-700" : "text-red-700"
              )}>{score}%</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">{t("inspection.confirm_submit")}</h3>
            <p className="text-sm text-gray-500 text-center mb-5">{t("inspection.confirm_submit_desc")}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 min-h-[48px]">
                {t("cancel")}
              </button>
              <button onClick={submitInspection}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 min-h-[48px] flex items-center justify-center gap-2">
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
