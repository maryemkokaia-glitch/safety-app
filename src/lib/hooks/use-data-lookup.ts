import { useCallback } from "react";
import type { AppData } from "../store";

export function useDataLookup(data: AppData) {
  const findProject = useCallback(
    (id: string) => data.projects.find((p) => p.id === id),
    [data.projects]
  );

  const findTemplate = useCallback(
    (id: string) => data.templates.find((t) => t.id === id),
    [data.templates]
  );

  const findUser = useCallback(
    (id: string) => data.users.find((u) => u.id === id),
    [data.users]
  );

  return { findProject, findTemplate, findUser };
}
