import { useMemo } from "react";
import type { AppData } from "../store";
import type { Project, TemplateWithItems, InspectionWithItems, User } from "../database.types";

function buildIndex<T extends { id: string }>(items: T[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const item of items) map.set(item.id, item);
  return map;
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    let arr = map.get(key);
    if (!arr) {
      arr = [];
      map.set(key, arr);
    }
    arr.push(item);
  }
  return map;
}

export function useDataLookup(data: AppData) {
  const projectIndex = useMemo(() => buildIndex(data.projects), [data.projects]);
  const templateIndex = useMemo(() => buildIndex(data.templates), [data.templates]);
  const userIndex = useMemo(() => buildIndex(data.users), [data.users]);
  const inspectionIndex = useMemo(() => buildIndex(data.inspections), [data.inspections]);

  const inspectionsByProject = useMemo(
    () => groupBy(data.inspections, (i) => i.project_id),
    [data.inspections]
  );

  const inspectionsByUser = useMemo(
    () => groupBy(data.inspections, (i) => i.inspector_id),
    [data.inspections]
  );

  return {
    findProject: (id: string) => projectIndex.get(id),
    findTemplate: (id: string) => templateIndex.get(id),
    findUser: (id: string) => userIndex.get(id),
    findInspection: (id: string) => inspectionIndex.get(id),
    getInspectionsByProject: (projectId: string) => inspectionsByProject.get(projectId) ?? [],
    getInspectionsByUser: (userId: string) => inspectionsByUser.get(userId) ?? [],
  };
}
