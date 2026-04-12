"use client";

import { useDemo } from "@/lib/demo-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FolderOpen, ClipboardCheck } from "lucide-react";
import { InspectionListItem } from "@/components/inspection-list-item";
import { useDataLookup } from "@/lib/hooks/use-data-lookup";
import Link from "next/link";

export default function ClientDashboard() {
  const { data, user, t } = useDemo();
  const { findProject, findTemplate } = useDataLookup(data);
  const myProjects = data.projects.filter((p) => p.client_id === user.id);
  const myInspections = data.inspections.filter((i) => myProjects.some((p) => p.id === i.project_id) && i.status === "completed");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("client.title")}</h1>
      <h2 className="text-lg font-semibold mb-3">{t("client.my_projects")}</h2>
      {myProjects.length === 0 ? (
        <Card className="mb-6"><div className="px-6 py-8 text-center text-gray-500 text-sm">{t("client.no_projects")}</div></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {myProjects.map((project) => (
            <Link key={project.id} href={`/client/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><FolderOpen className="w-5 h-5 text-navy-800" /></div><div><h3 className="font-semibold text-gray-900">{project.name}</h3><p className="text-xs text-gray-500">{project.address}</p></div></div></CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      <Card>
        <CardHeader><div className="flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-gray-400" /><h2 className="text-lg font-semibold">{t("client.recent_reports")}</h2></div></CardHeader>
        <div className="divide-y divide-gray-100">
          {myInspections.length === 0 ? <div className="px-6 py-8 text-center text-gray-500 text-sm">{t("client.no_reports")}</div> : myInspections.map((insp) => (
            <InspectionListItem
              key={insp.id}
              inspection={insp}
              href={`/client/reports/${insp.id}`}
              projectName={findProject(insp.project_id)?.name}
              templateName={findTemplate(insp.template_id)?.name}
              date={insp.completed_at ? new Date(insp.completed_at).toLocaleDateString("ka-GE") : undefined}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
