"use client";

import { useDemo } from "@/lib/demo-context";
import { Card } from "@/components/ui/card";
import { InspectionListItem } from "@/components/inspection-list-item";
import { useDataLookup } from "@/lib/hooks/use-data-lookup";

export default function InspectionHistoryPage() {
  const { data, user, t } = useDemo();
  const { findProject, findTemplate } = useDataLookup(data);
  const inspections = data.inspections.filter((i) => i.inspector_id === user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("inspection.history")}</h1>
      {inspections.length === 0 ? (
        <Card><div className="px-6 py-12 text-center text-gray-500 text-sm">{t("dashboard.no_inspections")}</div></Card>
      ) : (
        <Card>
          <div className="divide-y divide-gray-100">
            {inspections.map((insp) => (
              <InspectionListItem
                key={insp.id}
                inspection={insp}
                href={insp.status === "completed" ? `/client/reports/${insp.id}` : `/inspector/inspect/${insp.id}`}
                projectName={findProject(insp.project_id)?.name}
                templateName={findTemplate(insp.template_id)?.name}
                showStatus
                t={t}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
