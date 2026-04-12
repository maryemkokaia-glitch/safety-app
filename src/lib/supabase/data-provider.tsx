"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "./client";
import { useAuth } from "./auth-context";
import type { User, UserRole } from "../database.types";
import type { AppData } from "../store";
import { t as translate, type Lang, type TranslationKey } from "../i18n";
import { generateId } from "../store";
import { getStatusFromMeasurement, calculateSafetyScore } from "../utils/safety-score";

import { DemoContext } from "../demo-context";

export function SupabaseDataProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, loading: authLoading } = useAuth();
  const [lang, setLangState] = useState<Lang>("ka");

  const supabase = createClient();

  const makeEmptyData = (user: User): AppData => ({
    lang,
    currentRole: "inspector" as UserRole,
    currentUser: user,
    projects: [],
    templates: [],
    inspections: [],
    regulations: [],
    notifications: [],
    users: [],
  });

  const [data, setData] = useState<AppData | null>(null);

  const userId = authUser?.id;
  useEffect(() => {
    if (authLoading) return;
    if (!authUser || !userId) return;
    setData((prev) => prev || makeEmptyData(authUser));
    fetchAllData();
  }, [userId, authLoading]);

  async function fetchAllData() {
    if (!authUser) return;

    try {
      const results = await Promise.allSettled([
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("checklist_templates").select("*, items:checklist_template_items(*)").order("created_at"),
        supabase.from("inspections")
          .select("*, items:inspection_items(*, photos:inspection_photos(*), template_item:checklist_template_items(*))")
          .order("started_at", { ascending: false }),
        supabase.from("regulations").select("*").order("created_at"),
        supabase.from("notifications").select("*").eq("user_id", authUser.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("*"),
      ]);

      const tableNames = ["projects", "templates", "inspections", "regulations", "notifications", "profiles"];
      const getData = (idx: number) => {
        const r = results[idx];
        if (r.status === "rejected") {
          console.error(`Failed to fetch ${tableNames[idx]}:`, r.reason);
          return [];
        }
        if (r.value.error) {
          console.error(`Error fetching ${tableNames[idx]}:`, r.value.error.message);
          return [];
        }
        return r.value.data || [];
      };

      const projects = getData(0);
      const templates = getData(1);
      const inspections = getData(2);
      const regulations = getData(3);
      const notifications = getData(4);
      const users = getData(5);

      const mappedTemplates = (templates || []).map((t: any) => ({
        ...t,
        items: (t.items || []).sort((a: any, b: any) => a.order_index - b.order_index),
      }));

      const mappedInspections = (inspections || []).map((insp: any) => ({
        ...insp,
        items: (insp.items || []).map((item: any) => ({
          ...item,
          template_item: item.template_item || null,
          photos: item.photos || [],
        })),
      }));

      const appData: AppData = {
        lang,
        currentRole: (authUser.role as UserRole) || "inspector",
        currentUser: authUser,
        projects: projects || [],
        templates: mappedTemplates,
        inspections: mappedInspections,
        regulations: regulations || [],
        notifications: notifications || [],
        users: users || [],
      };

      setData(appData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setData({
        lang,
        currentRole: "inspector",
        currentUser: authUser,
        projects: [],
        templates: [],
        inspections: [],
        regulations: [],
        notifications: [],
        users: [],
      });
    }
  }

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    setData((prev) => prev ? { ...prev, lang: newLang } : prev);
  }, []);

  const setRole = useCallback((role: UserRole) => {
    setData((prev) => prev ? { ...prev, currentRole: role } : prev);
  }, []);

  const updateData = useCallback((updater: (data: AppData) => AppData) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...updater(prev) };

      // Only diff templates when the templates array actually changed
      if (prev.templates !== next.templates) {
        // Run sync outside the render cycle to avoid blocking
        queueMicrotask(() => syncTemplateChanges(prev, next));
      }

      return next;
    });
  }, []);

  // Sync template changes to Supabase (fire-and-forget)
  function syncTemplateChanges(prev: AppData, next: AppData) {
    // Detect added templates
    const prevIds = new Set(prev.templates.map((t) => t.id));
    const nextIds = new Set(next.templates.map((t) => t.id));

    for (const tmpl of next.templates) {
      if (!prevIds.has(tmpl.id)) {
        // New template
        supabase.from("checklist_templates").insert({
          id: tmpl.id, name: tmpl.name, category: tmpl.category, company_id: tmpl.company_id,
        }).then(({ error }) => { if (error) console.error("Insert template:", error.message); });
        // Insert items
        if (tmpl.items.length > 0) {
          supabase.from("checklist_template_items").insert(
            tmpl.items.map((item) => ({
              id: item.id, template_id: tmpl.id, text: item.text,
              order_index: item.order_index, is_critical: item.is_critical,
              input_type: item.input_type, unit: item.unit,
              norm_min: item.norm_min, norm_max: item.norm_max,
            }))
          ).then(({ error }) => { if (error) console.error("Insert items:", error.message); });
        }
        continue;
      }

      // Detect template name/field changes
      const prevTmpl = prev.templates.find((t) => t.id === tmpl.id);
      if (prevTmpl && prevTmpl.name !== tmpl.name) {
        supabase.from("checklist_templates").update({ name: tmpl.name }).eq("id", tmpl.id)
          .then(({ error }) => { if (error) console.error("Update template name:", error.message); });
      }

      if (!prevTmpl) continue;

      // Detect added items
      const prevItemIds = new Set(prevTmpl.items.map((i) => i.id));
      for (const item of tmpl.items) {
        if (!prevItemIds.has(item.id)) {
          supabase.from("checklist_template_items").insert({
            id: item.id, template_id: tmpl.id, text: item.text,
            order_index: item.order_index, is_critical: item.is_critical,
            input_type: item.input_type, unit: item.unit,
            norm_min: item.norm_min, norm_max: item.norm_max,
          }).then(({ error }) => { if (error) console.error("Insert item:", error.message); });
        }
      }

      // Detect deleted items
      const nextItemIds = new Set(tmpl.items.map((i) => i.id));
      for (const item of prevTmpl.items) {
        if (!nextItemIds.has(item.id)) {
          supabase.from("checklist_template_items").delete().eq("id", item.id)
            .then(({ error }) => { if (error) console.error("Delete item:", error.message); });
        }
      }

      // Detect changed items (text, order, critical, etc.)
      for (const item of tmpl.items) {
        const prevItem = prevTmpl.items.find((i) => i.id === item.id);
        if (prevItem && (prevItem.text !== item.text || prevItem.order_index !== item.order_index || prevItem.is_critical !== item.is_critical)) {
          supabase.from("checklist_template_items").update({
            text: item.text, order_index: item.order_index, is_critical: item.is_critical,
          }).eq("id", item.id)
            .then(({ error }) => { if (error) console.error("Update item:", error.message); });
        }
      }
    }

    // Detect deleted templates
    for (const tmpl of prev.templates) {
      if (!nextIds.has(tmpl.id)) {
        // Delete items first, then template
        supabase.from("checklist_template_items").delete().eq("template_id", tmpl.id)
          .then(() => supabase.from("checklist_templates").delete().eq("id", tmpl.id))
          .then(({ error }: any) => { if (error) console.error("Delete template:", error.message); });
      }
    }
  }

  const refresh = useCallback(() => {
    fetchAllData();
  }, [userId]);

  const reset = useCallback(() => {
    fetchAllData();
  }, [userId]);

  // === Supabase Mutations ===

  const createInspection = useCallback(async (projectId: string, templateId: string): Promise<string | null> => {
    if (!authUser) return null;

    const { data: templateItems } = await supabase
      .from("checklist_template_items")
      .select("*")
      .eq("template_id", templateId)
      .order("order_index");

    if (!templateItems) return null;

    const inspId = crypto.randomUUID();

    const { error: inspError } = await supabase.from("inspections").insert({
      id: inspId,
      project_id: projectId,
      template_id: templateId,
      inspector_id: authUser.id,
      status: "in_progress",
      started_at: new Date().toISOString(),
    });

    if (inspError) {
      console.error("Failed to create inspection:", inspError);
      return null;
    }

    const items = templateItems.map((ti: any) => ({
      id: crypto.randomUUID(),
      inspection_id: inspId,
      template_item_id: ti.id,
      status: "not_applicable",
      is_critical: ti.is_critical,
    }));

    const { error: itemsError } = await supabase.from("inspection_items").insert(items);

    if (itemsError) {
      console.error("Failed to create inspection items:", itemsError);
      return null;
    }

    // Local optimistic update instead of full refetch
    setData((prev) => {
      if (!prev) return prev;
      const template = prev.templates.find((t) => t.id === templateId);
      const newInspection = {
        id: inspId,
        project_id: projectId,
        template_id: templateId,
        inspector_id: authUser.id,
        status: "in_progress" as const,
        safety_score: null,
        notes: null,
        weather: null,
        started_at: new Date().toISOString(),
        completed_at: null,
        items: items.map((item: any) => {
          const tmplItem = templateItems.find((ti: any) => ti.id === item.template_item_id);
          return {
            ...item,
            comment: null,
            measured_value: null,
            template_item: tmplItem || null,
            photos: [],
          };
        }),
      };
      return { ...prev, inspections: [newInspection as any, ...prev.inspections] };
    });

    return inspId;
  }, [authUser]);

  const updateInspectionItem = useCallback(async (itemId: string, fields: Record<string, any>) => {
    // Optimistic local update — only clone the affected inspection
    setData((prev) => {
      if (!prev) return prev;
      const inspIdx = prev.inspections.findIndex((insp) =>
        insp.items.some((item) => item.id === itemId)
      );
      if (inspIdx === -1) return prev;
      const inspections = [...prev.inspections];
      const insp = inspections[inspIdx];
      inspections[inspIdx] = {
        ...insp,
        items: insp.items.map((item) =>
          item.id === itemId ? { ...item, ...fields } : item
        ),
      };
      return { ...prev, inspections };
    });

    // Persist to Supabase in background — don't await
    supabase
      .from("inspection_items")
      .update(fields)
      .eq("id", itemId)
      .then(({ error }) => {
        if (error) console.error("Failed to update item:", error);
      });
  }, []);

  const uploadPhoto = useCallback(async (itemId: string, file: File) => {
    const photoId = crypto.randomUUID();
    const path = `${authUser?.id}/${itemId}/${photoId}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("inspection-photos")
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      console.error("Failed to upload photo:", uploadError);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("inspection-photos")
      .getPublicUrl(path);

    const photoUrl = urlData.publicUrl;

    // Insert record — don't await, update optimistically
    supabase.from("inspection_photos").insert({
      id: photoId,
      inspection_item_id: itemId,
      photo_url: photoUrl,
      taken_at: new Date().toISOString(),
    }).then(({ error }) => {
      if (error) console.error("Failed to save photo record:", error);
    });

    // Optimistic local update — only clone affected inspection
    setData((prev) => {
      if (!prev) return prev;
      const inspIdx = prev.inspections.findIndex((insp) =>
        insp.items.some((item) => item.id === itemId)
      );
      if (inspIdx === -1) return prev;
      const inspections = [...prev.inspections];
      const insp = inspections[inspIdx];
      inspections[inspIdx] = {
        ...insp,
        items: insp.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                photos: [
                  ...(item.photos || []),
                  { id: photoId, inspection_item_id: itemId, photo_url: photoUrl, caption: null, taken_at: new Date().toISOString() },
                ],
              }
            : item
        ),
      };
      return { ...prev, inspections };
    });
  }, [authUser]);

  const removePhoto = useCallback(async (photoId: string, itemId: string) => {
    // Optimistic local update — only clone affected inspection
    setData((prev) => {
      if (!prev) return prev;
      const inspIdx = prev.inspections.findIndex((insp) =>
        insp.items.some((item) => item.id === itemId)
      );
      if (inspIdx === -1) return prev;
      const inspections = [...prev.inspections];
      const insp = inspections[inspIdx];
      inspections[inspIdx] = {
        ...insp,
        items: insp.items.map((item) =>
          item.id === itemId
            ? { ...item, photos: (item.photos || []).filter((p) => p.id !== photoId) }
            : item
        ),
      };
      return { ...prev, inspections };
    });

    // Delete in background
    supabase.from("inspection_photos").delete().eq("id", photoId);
  }, []);

  const submitInspection = useCallback(async (inspectionId: string, notes: string, score: number) => {
    // Update local state immediately
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        inspections: prev.inspections.map((insp) =>
          insp.id === inspectionId
            ? { ...insp, status: "completed" as const, safety_score: score, notes: notes || null, completed_at: new Date().toISOString() }
            : insp
        ),
      };
    });

    // Persist in background
    supabase.from("inspections").update({
      status: "completed",
      safety_score: score,
      notes: notes || null,
      completed_at: new Date().toISOString(),
    }).eq("id", inspectionId).then(({ error }) => {
      if (error) console.error("Failed to submit inspection:", error);
    });
  }, []);

  const t_fn = useCallback((key: TranslationKey) => translate(key, lang), [lang]);

  const contextValue = useMemo(() => {
    if (!data || !authUser) return null;
    return {
      data,
      user: authUser,
      role: data.currentRole,
      lang,
      setRole,
      setLang,
      updateData,
      refresh,
      reset,
      t: t_fn,
    };
  }, [data, authUser, lang, t_fn, setRole, setLang, updateData, refresh, reset]);

  // Still loading auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-800" />
      </div>
    );
  }

  if (!authUser) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  if (!data || !contextValue) {
    return null;
  }

  return (
    <DemoContext.Provider value={contextValue}>
      {children}
    </DemoContext.Provider>
  );
}

export { generateId };
