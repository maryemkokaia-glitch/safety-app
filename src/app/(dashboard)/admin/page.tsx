"use client";

import { useMemo } from "react";
import { useDemo } from "@/lib/demo-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Users, ClipboardCheck, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { InspectionListItem } from "@/components/inspection-list-item";
import { useDataLookup } from "@/lib/hooks/use-data-lookup";
import { getScoreBgColor } from "@/lib/utils/safety-score";
import Link from "next/link";

export default function AdminDashboard() {
  const { data, t } = useDemo();
  const { findProject, findTemplate, findUser } = useDataLookup(data);

  const { allItems, violations, warnings, safeItems, pendingInspections, completedInspections, avgScore } = useMemo(() => {
    const all = data.inspections.flatMap((i) => i.items || []);
    let safe = 0, warn = 0, viol = 0;
    const safeArr: typeof all = [], warnArr: typeof all = [], violArr: typeof all = [];
    for (const item of all) {
      if (item.status === "violation") { viol++; violArr.push(item); }
      else if (item.status === "warning") { warn++; warnArr.push(item); }
      else if (item.status === "safe") { safe++; safeArr.push(item); }
    }
    const pending = data.inspections.filter((i) => i.status === "in_progress");
    const completed = data.inspections.filter((i) => i.status === "completed");
    const scores = completed.filter((i) => i.safety_score != null).map((i) => i.safety_score!) as number[];
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    return { allItems: all, violations: violArr, warnings: warnArr, safeItems: safeArr, pendingInspections: pending, completedInspections: completed, avgScore: avg };
  }, [data.inspections]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("dashboard.title")}</h1>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 rounded-xl"><FolderOpen className="w-5 h-5 text-navy-800" /></div>
            <div><p className="text-2xl font-black text-gray-900">{data.projects.length}</p><p className="text-[11px] text-gray-500 font-medium">{t("dashboard.projects")}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-xl"><Users className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-black text-gray-900">{data.users.length}</p><p className="text-[11px] text-gray-500 font-medium">{t("dashboard.users")}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 rounded-xl"><ClipboardCheck className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-2xl font-black text-gray-900">{data.inspections.length}</p><p className="text-[11px] text-gray-500 font-medium">{t("dashboard.inspections")}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 rounded-xl"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-2xl font-black text-red-600">{violations.length}</p><p className="text-[11px] text-gray-500 font-medium">{t("dashboard.violations")}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Status overview bar */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              {avgScore != null ? `${t("score.average")}: ` : t("dashboard.inspections")}
            </h3>
            {avgScore != null && (
              <span className={`text-lg font-black px-3 py-0.5 rounded-full ${getScoreBgColor(avgScore)}`}>
                {avgScore}%
              </span>
            )}
          </div>

          {/* Status breakdown bar */}
          {allItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                {safeItems.length > 0 && <div className="bg-green-500 transition-[width]" style={{ width: `${(safeItems.length / allItems.length) * 100}%` }} />}
                {warnings.length > 0 && <div className="bg-amber-400 transition-[width]" style={{ width: `${(warnings.length / allItems.length) * 100}%` }} />}
                {violations.length > 0 && <div className="bg-red-500 transition-[width]" style={{ width: `${(violations.length / allItems.length) * 100}%` }} />}
              </div>
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-3 h-3" /> {safeItems.length} {t("inspection.safe")}</span>
                <span className="flex items-center gap-1 text-amber-600"><AlertTriangle className="w-3 h-3" /> {warnings.length} {t("inspection.warning")}</span>
                <span className="flex items-center gap-1 text-red-600"><XCircle className="w-3 h-3" /> {violations.length} {t("inspection.violation")}</span>
              </div>
            </div>
          )}

          {/* Pending inspections alert */}
          {pendingInspections.length > 0 && (
            <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-xs font-medium text-amber-800">
                {pendingInspections.length} {t("status.in_progress").toLowerCase()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent inspections */}
      <Card>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">{t("dashboard.recent")}</h2>
          <Link href="/admin/projects" className="text-xs text-navy-800 font-semibold hover:underline">{t("all")}</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {data.inspections.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 text-sm">{t("dashboard.no_inspections")}</div>
          ) : data.inspections.map((insp) => (
            <InspectionListItem
              key={insp.id}
              inspection={insp}
              href={`/client/reports/${insp.id}`}
              projectName={findProject(insp.project_id)?.name}
              templateName={findTemplate(insp.template_id)?.name}
              inspectorName={findUser(insp.inspector_id)?.full_name}
              showStatus
              t={t}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
