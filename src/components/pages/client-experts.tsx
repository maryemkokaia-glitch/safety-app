"use client";

import { useDemo } from "@/lib/demo-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ClipboardCheck, Star } from "lucide-react";
import Link from "next/link";

export default function ClientExperts() {
  const { data, user, t } = useDemo();

  // Get all inspectors
  const inspectors = data.users.filter((u) => u.role === "inspector");

  // Get stats for each inspector
  const inspectorStats = inspectors.map((inspector) => {
    const completedInspections = data.inspections.filter(
      (i) => i.inspector_id === inspector.id && i.status === "completed"
    );
    const scores = completedInspections
      .filter((i) => i.safety_score != null)
      .map((i) => i.safety_score!);
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    // Check if assigned to any of the client's projects
    const isAssigned = data.projects.some(
      (p) => p.client_id === user.id && p.inspector_id === inspector.id
    );

    return { inspector, completedInspections: completedInspections.length, avgScore, isAssigned };
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-xl">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("client.experts")}</h1>
          <p className="text-sm text-gray-500">{t("client.find_expert")}</p>
        </div>
      </div>

      {inspectorStats.length === 0 ? (
        <Card>
          <div className="px-6 py-12 text-center text-gray-500 text-sm">
            {t("client.no_experts")}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {inspectorStats.map(({ inspector, completedInspections, avgScore, isAssigned }) => (
            <Link key={inspector.id} href={`/client/experts/${inspector.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-navy-800 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0">
                      {inspector.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{inspector.full_name}</h3>
                        {isAssigned && (
                          <Badge variant="success" className="shrink-0">{t("client.assigned")}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{inspector.email}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <ClipboardCheck className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">{completedInspections}</span>
                          <span className="text-xs text-gray-400">{t("client.inspections_completed")}</span>
                        </div>
                        {avgScore != null && (
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium text-gray-700">{avgScore}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
