"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDemo, generateId } from "@/lib/demo-context";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, AlertTriangle, XCircle, MinusCircle, Send, ArrowLeft, MessageSquare, ChevronDown, Camera, X, Image, Ruler } from "lucide-react";
import { calculateSafetyScore, getScoreBgColor, getScoreLabel, getStatusFromMeasurement, formatNormRange } from "@/lib/utils/safety-score";
import type { ChecklistItemStatus, InspectionItem as InspectionItemType, InspectionPhoto } from "@/lib/database.types";

const STATUS_BUTTONS: { status: ChecklistItemStatus; icon: typeof CheckCircle; bg: string; ring: string; activeBg: string }[] = [
  { status: "safe", icon: CheckCircle, bg: "bg-green-500", ring: "ring-green-400", activeBg: "bg-green-50 border-green-300" },
  { status: "warning", icon: AlertTriangle, bg: "bg-amber-500", ring: "ring-amber-400", activeBg: "bg-amber-50 border-amber-300" },
  { status: "violation", icon: XCircle, bg: "bg-red-500", ring: "ring-red-400", activeBg: "bg-red-50 border-red-300" },
  { status: "not_applicable", icon: MinusCircle, bg: "bg-gray-400", ring: "ring-gray-300", activeBg: "bg-gray-50 border-gray-300" },
];

function compressImage(file: File, maxWidth: number = 1200): Promise<string> {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.src = url;
  });
}

interface InspectionItemProps {
  item: InspectionItemType & { template_item?: any; photos?: InspectionPhoto[] };
  idx: number;
  isExpanded: boolean;
  statusLabels: Record<string, string>;
  onToggleExpand: (id: string) => void;
  onStatusChange: (itemId: string, status: ChecklistItemStatus) => void;
  onCommentChange: (itemId: string, comment: string) => void;
  onMeasuredValueChange: (itemId: string, value: string) => void;
  onAddPhoto: (itemId: string, file: File) => void;
  onRemovePhoto: (itemId: string, photoId: string) => void;
  criticalLabel: string;
  commentPlaceholder: string;
  enterValuePlaceholder: string;
}

const InspectionItemRow = memo(function InspectionItemRow({
  item, idx, isExpanded, statusLabels, onToggleExpand, onStatusChange,
  onCommentChange, onMeasuredValueChange, onAddPhoto, onRemovePhoto,
  criticalLabel, commentPlaceholder, enterValuePlaceholder,
}: InspectionItemProps) {
  return (
    <div className={cn(
      "transition-colors",
      item.status === "violation" ? "bg-red-50/50" :
      item.status === "warning" ? "bg-amber-50/50" :
      item.status === "safe" ? "bg-green-50/40" : ""
    )}>
      <div className="px-4 py-3">
        {/* Question text */}
        <p className="text-[13px] font-medium text-gray-900 leading-snug mb-2">
          <span className="text-gray-400 mr-1.5">{idx + 1}.</span>
          {item.template_item?.text}
          {item.is_critical && <span className="text-red-500 ml-1">*</span>}
        </p>

        {item.template_item?.input_type === "measurement" ? (
          /* Measurement input */
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input type="number" step="any" inputMode="decimal"
                value={item.measured_value ?? ""}
                onChange={(e) => onMeasuredValueChange(item.id, e.target.value)}
                placeholder={enterValuePlaceholder}
                className={cn(
                  "w-full rounded-lg border-2 px-3 py-2 text-sm font-bold text-center min-h-[40px] outline-none transition-all",
                  item.status === "safe" ? "border-green-300 bg-green-50 text-green-700" :
                  item.status === "warning" ? "border-amber-300 bg-amber-50 text-amber-700" :
                  item.status === "violation" ? "border-red-300 bg-red-50 text-red-700" :
                  "border-gray-200 bg-white text-gray-600"
                )}
              />
              {item.template_item?.unit && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">{item.template_item.unit}</span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 shrink-0 max-w-[80px] text-right leading-tight">{formatNormRange(item.template_item?.norm_min, item.template_item?.norm_max, item.template_item?.unit)}</span>
          </div>
        ) : (
          /* Status buttons — 2x2 grid with labels, always visible */
          <div className="grid grid-cols-4 gap-1.5">
            {STATUS_BUTTONS.map(({ status, icon: Icon, activeBg }) => {
              const isActive = item.status === status;
              const label = statusLabels[status] || status;
              return (
                <button key={status} onClick={() => onStatusChange(item.id, status)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] font-semibold transition-all min-h-[44px]",
                    isActive ? `${activeBg} border` : "bg-white border border-gray-200 text-gray-400 active:scale-95"
                  )}>
                  <Icon className={cn("w-4 h-4", isActive ? (
                    status === "safe" ? "text-green-600" : status === "warning" ? "text-amber-600" : status === "violation" ? "text-red-600" : "text-gray-500"
                  ) : "text-gray-400")} />
                  <span className={isActive ? "text-gray-700" : ""}>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Comment + Photo row */}
        <div className="flex gap-2 mt-2">
          <button onClick={() => onToggleExpand(item.id)}
            className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors",
              item.comment ? "bg-blue-50 text-blue-700" : "text-gray-400 hover:bg-gray-100"
            )}>
            <MessageSquare className="w-3 h-3" />
            {item.comment ? "✓" : statusLabels.comment || "comment"}
          </button>
          <label className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors",
            (item.photos?.length ?? 0) > 0 ? "bg-blue-50 text-blue-700" : "text-gray-400 hover:bg-gray-100"
          )}>
            <Camera className="w-3 h-3" />
            {(item.photos?.length ?? 0) > 0 ? `${item.photos!.length}` : statusLabels.photo || "photo"}
            <input type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onAddPhoto(item.id, f); e.target.value = ""; }} />
          </label>
        </div>
      </div>

      {/* Comment area */}
      {isExpanded && (
        <div className="px-4 pb-3">
          <Textarea placeholder={commentPlaceholder} value={item.comment || ""}
            onChange={(e) => onCommentChange(item.id, e.target.value)} autoFocus rows={2} className="text-sm" />
        </div>
      )}

      {/* Photo strip */}
      {(item.photos?.length ?? 0) > 0 && (
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto">
            {item.photos!.map((photo) => (
              <div key={photo.id} className="relative shrink-0">
                <img src={photo.photo_url} alt="" className="w-14 h-14 object-cover rounded-lg" loading="lazy" />
                <button onClick={() => onRemovePhoto(item.id, photo.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default function InspectorInspect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, updateData, t } = useDemo();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const inspection = data.inspections.find((i) => i.id === id);
  if (!inspection) return <div className="text-center py-12 text-gray-500">{t("no_data")}</div>;

  const project = data.projects.find((p) => p.id === inspection.project_id);
  const template = data.templates.find((t) => t.id === inspection.template_id);
  const items = inspection.items;

  const statusLabels = useMemo(() => ({
    safe: t("inspection.safe"),
    warning: t("inspection.warning"),
    violation: t("inspection.violation"),
    not_applicable: "N/A",
    comment: t("inspection.comment"),
    photo: t("inspection.add_photo"),
  }), [t]);

  const { score, completedCount, progressPercent, violationCount, warningCount } = useMemo(() => {
    const s = calculateSafetyScore(items);
    const completed = items.filter((i) => i.status !== "not_applicable").length;
    return {
      score: s,
      completedCount: completed,
      progressPercent: items.length > 0 ? (completed / items.length) * 100 : 0,
      violationCount: items.filter((i) => i.status === "violation").length,
      warningCount: items.filter((i) => i.status === "warning").length,
    };
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

  const [showConfirm, setShowConfirm] = useState(false);
  const [sendToClient, setSendToClient] = useState(true);
  const clientEmails = (project as any)?.client_emails as string[] || [];

  function submitInspection() {
    const finalScore = calculateSafetyScore(items);
    updateData((d) => ({ ...d, inspections: d.inspections.map((insp) => insp.id === id ? { ...insp, status: "completed", safety_score: finalScore, notes: notes || null, completed_at: new Date().toISOString() } : insp) }));

    if (sendToClient && clientEmails.length > 0) {
      const subject = encodeURIComponent(`${t("inspection.finish")} — ${project?.name} — ${finalScore}%`);
      const body = encodeURIComponent(
        `${project?.name}\n${template?.name}\n\n${t("inspection.score")}: ${finalScore}%\n${t("inspection.violation")}: ${violationCount}\n${t("inspection.warning")}: ${warningCount}\n\n${notes || ""}\n\n— Sarke`
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
          <Badge className={cn(getScoreBgColor(score), "text-sm px-3 py-1 font-bold")}>{score}%</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-navy-800 rounded-full transition-[width] duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="text-[10px] text-gray-400 font-medium shrink-0">{completedCount}/{items.length}</span>
        </div>
      </div>

      {/* Checklist items */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4 divide-y divide-gray-100">
        {items.map((item, idx) => (
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
            criticalLabel={t("inspection.critical")}
            commentPlaceholder={t("inspection.comment") + "..."}
            enterValuePlaceholder={t("inspection.enter_value")}
          />
        ))}
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

      {/* Submit button */}
      <div className="fixed bottom-16 left-0 right-0 z-20 px-4 pb-2 lg:pl-68">
        <div className="max-w-xl mx-auto">
          <Button onClick={() => setShowConfirm(true)} size="lg" className="w-full text-base shadow-lg shadow-navy-800/20">
            <Send className="w-5 h-5 mr-2" />
            {t("inspection.finish")} — {score}% {getScoreLabel(score)}
          </Button>
          <p className="text-center text-xs text-gray-400 mt-1.5 bg-gray-50/80">
            {violationCount} {t("inspection.violation")} · {warningCount} {t("inspection.warning")}
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
