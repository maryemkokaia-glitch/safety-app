"use client";

import { useDemo } from "@/lib/demo-context";
import { Card, CardHeader } from "@/components/ui/card";
import { InspectionListItem } from "@/components/inspection-list-item";
import { useDataLookup } from "@/lib/hooks/use-data-lookup";
import { ClipboardCheck } from "lucide-react";

export default function ClientReportsList() {
  const { data, user, t } = useDemo();
  const { findProject, findTemplate } = useDataLookup(data);

  const myProjects = data.projects.filter((p) => p.client_id === user.id);
  const myReports = data.inspections
    .filter((i) => myProjects.some((p) => p.id === i.project_id) && i.status === "completed")
    .sort((a, b) => {
      const dateA = a.completed_at ? new Date(a.completed_at).getTime() : 0;
      const dateB = b.completed_at ? new Date(b.completed_at).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-xl">
          <ClipboardCheck className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("client.all_reports")}</h1>
          <p className="text-sm text-gray-500">{myReports.length} {t("client.reports")}</p>
        </div>
      </div>

      <Card>
        <div className="divide-y divide-gray-100">
          {myReports.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 text-sm">
              {t("client.no_reports")}
            </div>
          ) : (
            myReports.map((insp) => (
              <InspectionListItem
                key={insp.id}
                inspection={insp}
                href={`/client/reports/${insp.id}`}
                projectName={findProject(insp.project_id)?.name}
                templateName={findTemplate(insp.template_id)?.name}
                date={insp.completed_at ? new Date(insp.completed_at).toLocaleDateString("ka-GE") : undefined}
              />
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
