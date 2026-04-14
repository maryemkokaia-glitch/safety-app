"use client";

import { memo } from "react";
import { cn } from "@/lib/utils/cn";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, MinusCircle, MessageSquare, Camera, X } from "lucide-react";
import { formatNormRange } from "@/lib/utils/safety-score";
import type { ChecklistItemStatus, InspectionItem as InspectionItemType, InspectionPhoto } from "@/lib/database.types";

const STATUS_BUTTONS: { status: ChecklistItemStatus; icon: typeof CheckCircle; activeBg: string }[] = [
  { status: "safe", icon: CheckCircle, activeBg: "bg-green-50 border-green-300" },
  { status: "violation", icon: XCircle, activeBg: "bg-red-50 border-red-300" },
  { status: "not_applicable", icon: MinusCircle, activeBg: "bg-gray-50 border-gray-300" },
];

export interface InspectionItemRowProps {
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
  commentPlaceholder: string;
  enterValuePlaceholder: string;
}

export const InspectionItemRow = memo(function InspectionItemRow({
  item, idx, isExpanded, statusLabels, onToggleExpand, onStatusChange,
  onCommentChange, onMeasuredValueChange, onAddPhoto, onRemovePhoto,
  commentPlaceholder, enterValuePlaceholder,
}: InspectionItemRowProps) {
  return (
    <div className={cn(
      "transition-colors",
      item.status === "violation" ? "bg-red-50/50" :
      item.status === "safe" ? "bg-green-50/40" : ""
    )}>
      <div className="px-4 py-4">
        {/* Question text — bilingual */}
        <div className="mb-3">
          <p className="text-[13px] font-medium text-gray-900 leading-snug">
            <span className="text-gray-400 mr-1.5">{idx + 1}.</span>
            {item.template_item?.text}
            {item.is_critical && <span className="text-red-500 ml-1">*</span>}
          </p>
          {item.template_item?.text_en && (
            <p className="text-[11px] text-gray-400 leading-snug ml-4 mt-0.5">{item.template_item.text_en}</p>
          )}
        </div>

        {item.template_item?.input_type === "measurement" ? (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input type="number" step="any" inputMode="decimal"
                value={item.measured_value ?? ""}
                onChange={(e) => onMeasuredValueChange(item.id, e.target.value)}
                placeholder={enterValuePlaceholder}
                className={cn(
                  "w-full rounded-lg border-2 px-3 py-2 text-sm font-bold text-center min-h-[40px] outline-none transition-all",
                  item.status === "safe" ? "border-green-300 bg-green-50 text-green-700" :
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
          <div className="grid grid-cols-3 gap-1.5">
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
                    status === "safe" ? "text-green-600" : status === "violation" ? "text-red-600" : "text-gray-500"
                  ) : "text-gray-400")} />
                  <span className={isActive ? "text-gray-700" : ""}>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Comment + Photo chips */}
        <div className="flex items-center gap-2 mt-3">
          <button onClick={() => onToggleExpand(item.id)}
            className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              item.comment
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
            )}>
            <MessageSquare className="w-3 h-3" />
            {statusLabels.comment}{item.comment ? " ✓" : ""}
          </button>
          <label className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-colors",
            (item.photos?.length ?? 0) > 0
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
          )}>
            <Camera className="w-3 h-3" />
            {(item.photos?.length ?? 0) > 0 ? `${item.photos!.length} ფოტო` : statusLabels.photo}
            <input type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onAddPhoto(item.id, f); e.target.value = ""; }} />
          </label>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-3">
          <Textarea placeholder={commentPlaceholder} value={item.comment || ""}
            onChange={(e) => onCommentChange(item.id, e.target.value)} autoFocus rows={2} className="text-sm" />
        </div>
      )}

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
