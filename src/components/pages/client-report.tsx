"use client";



import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2, CheckCircle, AlertTriangle, XCircle, MinusCircle, Calendar, User, MapPin, FileText, Ruler, Share2 } from "lucide-react";
import { getScoreBgColor, getScoreLabel, getStatusLabel, getStatusColor, formatNormRange } from "@/lib/utils/safety-score";
import { generatePDF } from "@/lib/utils/pdf";
import { Breadcrumb } from "@/components/ui/breadcrumb";

function StatusIcon({ status }: { status: string }) {
  const cls = "w-5 h-5";
  switch (status) {
    case "safe": return <CheckCircle className={`${cls} text-green-500`} />;
    case "warning": return <AlertTriangle className={`${cls} text-amber-500`} />;
    case "violation": return <XCircle className={`${cls} text-red-500`} />;
    default: return <MinusCircle className={`${cls} text-gray-300`} />;
  }
}

export default function ClientReport() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, t, lang } = useDemo();
  const [generating, setGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (pdfError) {
      const timer = setTimeout(() => setPdfError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [pdfError]);

  const inspection = data.inspections.find((i) => i.id === id);
  if (!inspection) return <div className="text-center py-12 text-gray-500">{t("no_data")}</div>;

  const project = data.projects.find((p) => p.id === inspection.project_id);
  const template = data.templates.find((tt) => tt.id === inspection.template_id);
  const inspector = data.users.find((u) => u.id === inspection.inspector_id);
  const items = inspection.items ?? [];
  const violations = items.filter((i) => i.status === "violation");
  const warnings = items.filter((i) => i.status === "warning");
  const safe = items.filter((i) => i.status === "safe");
  const na = items.filter((i) => i.status === "not_applicable");
  const score = inspection.safety_score ?? 0;

  async function handleDownloadPDF() {
    if (!inspection) return;
    setGenerating(true);
    setPdfError(null);
    try {
      const result = await generatePDF(
        {
          safety_score: inspection.safety_score ?? null,
          started_at: inspection.started_at,
          notes: inspection.notes ?? null,
          project: { name: project?.name, address: project?.address ?? null },
          template: { name: template?.name },
          inspector: { full_name: inspector?.full_name },
        },
        items
      );
      if (!result.fontLoaded) {
        setPdfError(t("report.font_warning"));
      }
    } catch (e) {
      console.error(e);
      setPdfError(t("report.pdf_error"));
    }
    setGenerating(false);
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Breadcrumb + Header */}
      <Breadcrumb
        items={[
          { label: t("nav.dashboard"), href: "/client" },
          { label: t("client.all_reports"), href: "/client/reports" },
        ]}
        current={template?.name ?? "..."}
      />
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} aria-label="Back"
          className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-gray-900 truncate">{template?.name}</h1>
          <p className="text-xs text-gray-500 truncate">{project?.name}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => { setShared(true); setTimeout(() => setShared(false), 2000); }}
              variant="outline" size="sm"
            >
              {shared ? (
                <><CheckCircle className="w-4 h-4 mr-1 text-green-500" />{t("client.shared_success")}</>
              ) : (
                <><Share2 className="w-4 h-4 mr-1" />{t("client.share_report")}</>
              )}
            </Button>
            <Button onClick={handleDownloadPDF} disabled={generating} variant="outline" size="sm">
              {generating ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" />{t("report.generating")}</>
              ) : (
                <><Download className="w-4 h-4 mr-1" />{t("report.download_pdf")}</>
              )}
            </Button>
          </div>
          {pdfError && (
            <p className={`text-xs ${pdfError === t("report.font_warning") ? "text-amber-600" : "text-red-500"}`}>
              {pdfError}
            </p>
          )}
        </div>
      </div>

      {/* Score card */}
      <div className={`rounded-2xl p-5 mb-4 ${getScoreBgColor(score)}`}>
        <div className="text-center mb-4">
          <p className="text-5xl font-black">{score}%</p>
          <p className="text-sm font-semibold mt-1 opacity-80">{lang === "ka" ? getScoreLabel(score) : (score >= 90 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Needs Attention" : "Critical")}</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/30 rounded-xl py-2 text-center">
            <p className="text-xl font-bold">{safe.length}</p>
            <p className="text-[10px] font-medium opacity-70">{t("inspection.safe")}</p>
          </div>
          <div className="bg-white/30 rounded-xl py-2 text-center">
            <p className="text-xl font-bold">{warnings.length}</p>
            <p className="text-[10px] font-medium opacity-70">{t("inspection.warning")}</p>
          </div>
          <div className="bg-white/30 rounded-xl py-2 text-center">
            <p className="text-xl font-bold">{violations.length}</p>
            <p className="text-[10px] font-medium opacity-70">{t("inspection.violation")}</p>
          </div>
          <div className="bg-white/30 rounded-xl py-2 text-center">
            <p className="text-xl font-bold">{na.length}</p>
            <p className="text-[10px] font-medium opacity-70">{t("inspection.na")}</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <Card className="mb-4">
        <CardContent className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{project?.name} {project?.address && `· ${project.address}`}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <User className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{inspector?.full_name}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{new Date(inspection.started_at).toLocaleDateString("ka-GE")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {inspection.notes && (
        <Card className="mb-4">
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900 text-sm">{t("report.notes")}</h3>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{inspection.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Violations */}
      {violations.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-red-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <XCircle className="w-4 h-4" /> {t("report.violations")} ({violations.length})
          </h2>
          <div className="space-y-2">
            {violations.map((item) => (
              <Card key={item.id} className="border-l-4 border-l-red-400">
                <CardContent>
                  <p className="text-sm font-medium text-gray-900">{item.template_item?.text}</p>
                  {item.is_critical && <Badge variant="danger" className="mt-1.5">{t("inspection.critical")}</Badge>}
                  {item.comment && <p className="text-xs text-gray-500 mt-1.5 italic">{item.comment}</p>}
                  {(item.photos?.length ?? 0) > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {item.photos!.map((photo) => (
                        <img key={photo.id} src={photo.photo_url} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" loading="lazy" />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All items */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">{t("report.all_items")}</h2>
        </CardHeader>
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="px-5 py-3.5 flex items-start gap-3">
              <StatusIcon status={item.status} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 leading-snug">{item.template_item?.text}</p>
                {/* Measurement value display */}
                {item.template_item?.input_type === "measurement" && item.measured_value != null && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold">{item.measured_value} {item.template_item?.unit}</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <Ruler className="w-2.5 h-2.5" /> {formatNormRange(item.template_item?.norm_min, item.template_item?.norm_max, item.template_item?.unit)}
                    </span>
                  </div>
                )}
                {item.comment && <p className="text-xs text-gray-500 mt-1 italic">{item.comment}</p>}
                {(item.photos?.length ?? 0) > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-1.5">
                    {item.photos!.map((photo) => (
                      <img key={photo.id} src={photo.photo_url} alt="" className="w-12 h-12 object-cover rounded border border-gray-200" loading="lazy" />
                    ))}
                  </div>
                )}
              </div>
              <Badge className={`${getStatusColor(item.status)} shrink-0`}>
                {lang === "ka" ? getStatusLabel(item.status) : item.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
