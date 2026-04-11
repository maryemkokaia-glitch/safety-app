"use client";



import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDemo, generateId } from "@/lib/demo-context";
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
  const [weather, setWeather] = useState("");
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
  function submitInspection() {
    const score = calculateSafetyScore(items);
    updateData((d) => ({ ...d, inspections: d.inspections.map((insp) => insp.id === id ? { ...insp, status: "completed", safety_score: score, notes: notes || null, weather: weather || null, completed_at: new Date().toISOString() } : insp) }));
    router.push("/inspector");
  }
  function updatePhotoCaption(itemId: string, photoId: string, caption: string) {
    updateData((d) => ({ ...d, inspections: d.inspections.map((insp) => insp.id === id ? { ...insp, items: insp.items.map((item) => item.id === itemId ? { ...item, photos: (item.photos || []).map((p) => p.id === photoId ? { ...p, caption: caption || null } : p) } : item) } : insp) }));
  }

  const score = calculateSafetyScore(items);
  const completedCount = items.filter((i) => i.status !== "not_applicable").length;
  const progressPercent = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div className="max-w-xl mx-auto -mt-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-gray-900 truncate">{template?.name}</h1>
          <p className="text-xs text-gray-500 truncate">{project?.name}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500">{t("inspection.progress")}: {completedCount}/{items.length}</span>
          <Badge className={`${getScoreBgColor(score)} text-sm px-3 py-1 font-bold`}>{score}%</Badge>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
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
              {/* Item header */}
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-start gap-2.5 mb-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-snug">{item.template_item?.text}</p>
                    {item.is_critical && <Badge variant="danger" className="mt-1.5">{t("inspection.critical")}</Badge>}
                  </div>
                </div>

                {item.template_item?.input_type === "measurement" ? (
                  /* Measurement input */
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          step="any"
                          inputMode="decimal"
                          value={item.measured_value ?? ""}
                          onChange={(e) => updateMeasuredValue(item.id, e.target.value)}
                          placeholder={t("inspection.enter_value")}
                          className={cn(
                            "w-full rounded-xl border-2 px-4 py-3 text-lg font-bold text-center min-h-[56px] outline-none transition-all",
                            item.status === "safe" ? "border-green-300 bg-green-50 text-green-700" :
                            item.status === "warning" ? "border-amber-300 bg-amber-50 text-amber-700" :
                            item.status === "violation" ? "border-red-300 bg-red-50 text-red-700" :
                            "border-gray-200 bg-gray-50 text-gray-600"
                          )}
                        />
                        {item.template_item?.unit && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                            {item.template_item.unit}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Norm range + auto status */}
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Ruler className="w-3 h-3" />
                        {t("template.norm")}: {formatNormRange(item.template_item?.norm_min, item.template_item?.norm_max, item.template_item?.unit)}
                      </span>
                      {item.measured_value != null && (
                        <Badge variant={item.status === "safe" ? "success" : item.status === "warning" ? "warning" : item.status === "violation" ? "danger" : "default"}>
                          {item.status === "safe" ? t("inspection.safe") : item.status === "warning" ? t("inspection.warning") : item.status === "violation" ? t("inspection.violation") : "—"}
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Status buttons — 2x2 grid on mobile, 4 cols on larger */
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {statusButtons.map(({ status, icon: Icon, label, bg, ring, activeBg }) => {
                      const isActive = item.status === status;
                      return (
                        <button key={status} onClick={() => updateItemStatus(item.id, status)}
                          className={cn(
                            "flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all border-2 min-h-[48px]",
                            isActive ? `${activeBg} text-gray-900` : "bg-gray-50 border-transparent text-gray-500 active:scale-95"
                          )}>
                          <Icon className={cn("w-4 h-4", isActive && (status === "safe" ? "text-green-600" : status === "warning" ? "text-amber-600" : status === "violation" ? "text-red-600" : "text-gray-500"))} />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Comment & photo toggle */}
              <button onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                className="w-full flex items-center justify-center gap-1 py-2.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-t border-gray-100">
                <MessageSquare className="w-3.5 h-3.5" />
                {t("inspection.comment")}{item.comment ? " *" : ""}
                {(item.photos?.length ?? 0) > 0 && (
                  <span className="ml-1 flex items-center gap-0.5">
                    <Image className="w-3 h-3" /> {item.photos!.length}
                  </span>
                )}
                <ChevronDown className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-180")} />
              </button>

              {/* Comment & photo area */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50">
                  <div className="pt-3 space-y-3">
                    <Textarea placeholder={t("inspection.comment") + "..."} value={item.comment || ""}
                      onChange={(e) => updateItemComment(item.id, e.target.value)} />

                    {/* Photo capture */}
                    <div>
                      <label className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 text-sm text-gray-500 hover:text-blue-600 cursor-pointer transition-colors active:scale-95">
                        <Camera className="w-4 h-4" />
                        {t("inspection.add_photo")}
                        <input type="file" accept="image/*" capture="environment" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) addItemPhoto(item.id, f); e.target.value = ""; }} />
                      </label>
                    </div>

                    {/* Photo thumbnails with captions */}
                    {(item.photos?.length ?? 0) > 0 && (
                      <div className="space-y-2">
                        {item.photos!.map((photo) => (
                          <div key={photo.id} className="flex items-start gap-2 bg-white rounded-xl border border-gray-200 p-2">
                            <div className="relative shrink-0">
                              <img src={photo.photo_url} alt="" className="w-16 h-16 object-cover rounded-lg" />
                              <button onClick={() => removeItemPhoto(item.id, photo.id)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder={t("inspection.photo_caption")}
                              value={photo.caption || ""}
                              onChange={(e) => updatePhotoCaption(item.id, photo.id, e.target.value)}
                              className="flex-1 text-xs border-0 bg-transparent py-1 px-0 placeholder-gray-400 focus:outline-none focus:ring-0 min-h-[32px]"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Weather & notes */}
      <Card className="mb-4">
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("inspection.weather")}</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: "sunny", icon: "☀️", label: t("weather.sunny") },
                  { value: "cloudy", icon: "☁️", label: t("weather.cloudy") },
                  { value: "rainy", icon: "🌧️", label: t("weather.rainy") },
                  { value: "windy", icon: "💨", label: t("weather.windy") },
                ].map((w) => (
                  <button key={w.value} onClick={() => setWeather(weather === w.value ? "" : w.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-all border-2 min-h-[52px]",
                      weather === w.value ? "border-blue-300 bg-blue-50 text-blue-700" : "border-transparent bg-gray-50 text-gray-500 active:scale-95"
                    )}>
                    <span className="text-lg">{w.icon}</span>
                    <span>{w.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <Textarea label={t("inspection.notes")} placeholder={t("inspection.notes_placeholder")}
              value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Submit button — full width, prominent */}
      <div className="pb-4">
        <Button onClick={submitInspection} size="lg" className="w-full text-base">
          <Send className="w-5 h-5 mr-2" />
          {t("inspection.finish")} — {score}% {getScoreLabel(score)}
        </Button>
        <p className="text-center text-xs text-gray-400 mt-2">
          {items.filter((i) => i.status === "violation").length} {t("inspection.violation")} · {items.filter((i) => i.status === "warning").length} {t("inspection.warning")}
        </p>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
