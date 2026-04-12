"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useDemo } from "@/lib/demo-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InspectionListItem } from "@/components/inspection-list-item";
import { useDataLookup } from "@/lib/hooks/use-data-lookup";
import { ArrowLeft, Mail, Phone, ClipboardCheck, Star, UserPlus, Check } from "lucide-react";
import Link from "next/link";

export default function ClientExpertProfile() {
  const { id } = useParams<{ id: string }>();
  const { data, user, t } = useDemo();
  const { findProject, findTemplate } = useDataLookup(data);
  const [assigned, setAssigned] = useState(false);

  const inspector = data.users.find((u) => u.id === id);
  if (!inspector) return <div className="text-center py-12 text-gray-500">{t("no_data")}</div>;

  const myProjects = data.projects.filter((p) => p.client_id === user.id);
  const inspections = data.inspections.filter(
    (i) => i.inspector_id === inspector.id && i.status === "completed" &&
    myProjects.some((p) => p.id === i.project_id)
  );

  const allInspections = data.inspections.filter(
    (i) => i.inspector_id === inspector.id && i.status === "completed"
  );
  const scores = allInspections
    .filter((i) => i.safety_score != null)
    .map((i) => i.safety_score!);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  const isAlreadyAssigned = myProjects.some((p) => p.inspector_id === inspector.id);

  return (
    <div className="max-w-xl mx-auto">
      <Link href="/client/experts" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> {t("back")}
      </Link>

      {/* Profile card */}
      <Card className="mb-4">
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {inspector.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 mb-1">{inspector.full_name}</h1>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{inspector.email}</span>
                </div>
                {inspector.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{inspector.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <CardContent className="text-center">
            <ClipboardCheck className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-3xl font-bold">{allInspections.length}</p>
            <p className="text-xs text-gray-500">{t("client.inspections_completed")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            {avgScore != null ? (
              <>
                <p className="text-3xl font-bold">{avgScore}%</p>
                <p className="text-xs text-gray-500">{t("client.avg_score")}</p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-300">-</p>
                <p className="text-xs text-gray-500">{t("client.avg_score")}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assign button */}
      {!isAlreadyAssigned && (
        <Button
          onClick={() => setAssigned(true)}
          disabled={assigned}
          size="lg"
          className="w-full mb-4 font-semibold"
          variant={assigned ? "secondary" : "primary"}
        >
          {assigned ? (
            <><Check className="w-5 h-5 mr-2" />{t("client.assigned")}</>
          ) : (
            <><UserPlus className="w-5 h-5 mr-2" />{t("client.assign_to_project")}</>
          )}
        </Button>
      )}

      {isAlreadyAssigned && (
        <div className="mb-4">
          <Badge variant="success" className="text-sm px-3 py-1.5">
            {t("client.assigned")}
          </Badge>
        </div>
      )}

      {/* Inspections for my projects */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">{t("client.inspections_completed")}</h2>
        </CardHeader>
        <div className="divide-y divide-gray-100">
          {inspections.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 text-sm">
              {t("dashboard.no_inspections")}
            </div>
          ) : (
            inspections.map((insp) => (
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
