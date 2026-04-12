"use client";

import { useDemo } from "@/lib/demo-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, MapPin, ClipboardCheck } from "lucide-react";
import Link from "next/link";

export default function ClientProjectsList() {
  const { data, user, t } = useDemo();

  const myProjects = data.projects.filter((p) => p.client_id === user.id);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-xl">
          <FolderOpen className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("client.my_projects")}</h1>
          <p className="text-sm text-gray-500">{t("client.projects_list")}</p>
        </div>
      </div>

      {myProjects.length === 0 ? (
        <Card>
          <div className="px-6 py-12 text-center text-gray-500 text-sm">
            {t("client.no_projects")}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {myProjects.map((project) => {
            const inspections = data.inspections.filter(
              (i) => i.project_id === project.id && i.status === "completed"
            );
            const scores = inspections
              .filter((i) => i.safety_score != null)
              .map((i) => i.safety_score!);
            const avgScore = scores.length > 0
              ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
              : null;

            const statusColor = project.status === "active"
              ? "bg-green-100 text-green-700"
              : project.status === "paused"
                ? "bg-amber-100 text-amber-700"
                : "bg-gray-100 text-gray-700";

            const inspector = data.users.find((u) => u.id === project.inspector_id);

            return (
              <Link key={project.id} href={`/client/projects/${project.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FolderOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{project.name}</h3>
                          {project.address && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {project.address}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className={statusColor}>
                        {t(`status.${project.status}` as any)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <ClipboardCheck className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{inspections.length}</span>
                        <span className="text-xs text-gray-400">{t("dashboard.inspections")}</span>
                      </div>
                      {avgScore != null && (
                        <div className="text-sm">
                          <span className="font-medium">{avgScore}%</span>
                          <span className="text-xs text-gray-400 ml-1">{t("client.avg_score")}</span>
                        </div>
                      )}
                    </div>

                    {inspector && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                        <div className="w-6 h-6 bg-navy-800/10 rounded-full flex items-center justify-center text-[10px] font-bold text-navy-800">
                          {inspector.full_name.charAt(0)}
                        </div>
                        <span className="text-xs text-gray-500">{inspector.full_name}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
