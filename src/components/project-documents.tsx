"use client";

import { useState } from "react";
import { useDemo, generateId } from "@/lib/demo-context";
import { cn } from "@/lib/utils/cn";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FileText, Plus, Calendar, X, AlertCircle, Check } from "lucide-react";
import { getDocumentStatus, daysUntilExpiry } from "@/lib/utils/alerts";
import type { DocumentType, ProjectDocument } from "@/lib/database.types";
import type { TranslationKey } from "@/lib/i18n";

const DOC_TYPES: DocumentType[] = [
  "safety_certificate",
  "insurance",
  "inspection_passport",
  "training_cert",
  "risk_assessment",
  "other",
];

export function ProjectDocuments({ projectId }: { projectId: string }) {
  const { data, updateData, t } = useDemo();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState<DocumentType>("safety_certificate");
  const [expiryDate, setExpiryDate] = useState("");

  const docs = (data.documents || []).filter((d) => d.project_id === projectId);
  const sorted = [...docs].sort((a, b) => {
    const sa = getDocumentStatus(a);
    const sb = getDocumentStatus(b);
    const order = { expired: 0, expiring_soon: 1, valid: 2, no_expiry: 3 };
    return order[sa] - order[sb];
  });

  function addDocument() {
    if (!title.trim()) return;
    const newDoc: ProjectDocument = {
      id: generateId(),
      project_id: projectId,
      title: title.trim(),
      doc_type: docType,
      expiry_date: expiryDate || null,
      uploaded_at: new Date().toISOString(),
      note: null,
    };
    updateData((d) => ({ ...d, documents: [...(d.documents || []), newDoc] }));
    setTitle("");
    setDocType("safety_certificate");
    setExpiryDate("");
    setShowAdd(false);
  }

  function removeDoc(id: string) {
    updateData((d) => ({ ...d, documents: (d.documents || []).filter((x) => x.id !== id) }));
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-gray-400" />
          {t("documents.title")} ({docs.length})
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors min-h-[32px]"
        >
          <Plus className="w-3.5 h-3.5" />
          {t("documents.add")}
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-6 text-center">
          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">{t("documents.none")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {sorted.map((doc) => {
            const status = getDocumentStatus(doc);
            const days = daysUntilExpiry(doc);
            return (
              <div key={doc.id} className="px-4 py-3 flex items-center gap-3">
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                    status === "expired"
                      ? "bg-red-50 text-red-600"
                      : status === "expiring_soon"
                      ? "bg-amber-50 text-amber-600"
                      : status === "valid"
                      ? "bg-green-50 text-green-600"
                      : "bg-gray-50 text-gray-400"
                  )}
                >
                  {status === "expired" ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : status === "expiring_soon" ? (
                    <Calendar className="w-4 h-4" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{doc.title}</p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {t(`documents.type.${doc.doc_type}` as TranslationKey)}
                    {doc.expiry_date && (
                      <>
                        {" · "}
                        {status === "expired" && (
                          <span className="text-red-600 font-medium">
                            {t("documents.expired")} ({Math.abs(days ?? 0)}d)
                          </span>
                        )}
                        {status === "expiring_soon" && (
                          <span className="text-amber-600 font-medium">
                            {t("documents.expiring_soon")} ({days}d)
                          </span>
                        )}
                        {status === "valid" && (
                          <span className="text-green-600">
                            {new Date(doc.expiry_date).toLocaleDateString("ka-GE")}
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => removeDoc(doc.id)}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Delete"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={t("documents.add")}>
        <div className="space-y-4">
          <Input
            id="docTitle"
            label={t("documents.title_label")}
            placeholder="მაგ: ხარაჩოს სერთიფიკატი"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <Select
            id="docType"
            label={t("documents.type_label")}
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocumentType)}
            options={DOC_TYPES.map((v) => ({ value: v, label: t(`documents.type.${v}` as TranslationKey) }))}
          />
          <Input
            id="docExpiry"
            label={t("documents.expiry_label")}
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setShowAdd(false)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 min-h-[48px]"
            >
              {t("cancel")}
            </button>
            <button
              onClick={addDocument}
              disabled={!title.trim()}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 min-h-[48px]"
            >
              {t("create")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
