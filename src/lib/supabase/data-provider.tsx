"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
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

  // Initialize with empty data immediately — no loading screen
  const makeEmptyData = (user: any): AppData => ({
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

  // Set empty data as soon as user is available, then fetch in background
  // Use authUser?.id as dep to avoid infinite loop from object reference changes
  const userId = authUser?.id;
  useEffect(() => {
    if (authLoading) return;
    if (!authUser || !userId) return;
    // Immediately show empty data — no spinner
    setData((prev) => prev || makeEmptyData(authUser));
    // Then fetch real data in background
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

      const getData = (idx: number) => {
        const r = results[idx];
        return r.status === "fulfilled" ? r.value.data || [] : [];
      };

      const projects = getData(0);
      const templates = getData(1);
      const inspections = getData(2);
      const regulations = getData(3);
      const notifications = getData(4);
      const users = getData(5);

      // Map templates to include items array properly
      const mappedTemplates = (templates || []).map((t: any) => ({
        ...t,
        items: (t.items || []).sort((a: any, b: any) => a.order_index - b.order_index),
      }));

      // Map inspections to include items with template_item and photos
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
      // Still set data with empty arrays so app doesn't get stuck
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

  // Generic updateData for compatibility — updates local state only
  const updateData = useCallback((updater: (data: AppData) => AppData) => {
    setData((prev) => {
      if (!prev) return prev;
      return { ...updater(prev) };
    });
  }, []);

  const refresh = useCallback(() => {
    fetchAllData();
  }, [userId]);

  const reset = useCallback(() => {
    fetchAllData();
  }, [userId]);

  // === Supabase Mutations ===

  const createInspection = useCallback(async (projectId: string, templateId: string): Promise<string | null> => {
    if (!authUser) return null;

    // Get template items
    const { data: templateItems } = await supabase
      .from("checklist_template_items")
      .select("*")
      .eq("template_id", templateId)
      .order("order_index");

    if (!templateItems) return null;

    const inspId = crypto.randomUUID();

    // Insert inspection
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

    // Insert inspection items
    const items = templateItems.map((ti: any) => ({
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

    // Refresh data to get the new inspection
    await fetchAllData();
    return inspId;
  }, [authUser]);

  const updateInspectionItem = useCallback(async (itemId: string, fields: Record<string, any>) => {
    // Optimistic local update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        inspections: prev.inspections.map((insp) => ({
          ...insp,
          items: insp.items.map((item) =>
            item.id === itemId ? { ...item, ...fields } : item
          ),
        })),
      };
    });

    // Persist to Supabase
    const { error } = await supabase
      .from("inspection_items")
      .update(fields)
      .eq("id", itemId);

    if (error) console.error("Failed to update item:", error);
  }, []);

  const uploadPhoto = useCallback(async (itemId: string, file: File) => {
    const photoId = crypto.randomUUID();
    const path = `${authUser?.id}/${itemId}/${photoId}.jpg`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("inspection-photos")
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      console.error("Failed to upload photo:", uploadError);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("inspection-photos")
      .getPublicUrl(path);

    const photoUrl = urlData.publicUrl;

    // Insert record
    const { error: insertError } = await supabase.from("inspection_photos").insert({
      id: photoId,
      inspection_item_id: itemId,
      photo_url: photoUrl,
      taken_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Failed to save photo record:", insertError);
      return;
    }

    // Optimistic local update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        inspections: prev.inspections.map((insp) => ({
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
        })),
      };
    });
  }, [authUser]);

  const removePhoto = useCallback(async (photoId: string, itemId: string) => {
    // Optimistic local update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        inspections: prev.inspections.map((insp) => ({
          ...insp,
          items: insp.items.map((item) =>
            item.id === itemId
              ? { ...item, photos: (item.photos || []).filter((p) => p.id !== photoId) }
              : item
          ),
        })),
      };
    });

    // Delete from DB
    await supabase.from("inspection_photos").delete().eq("id", photoId);
  }, []);

  const submitInspection = useCallback(async (inspectionId: string, notes: string, score: number) => {
    const { error } = await supabase.from("inspections").update({
      status: "completed",
      safety_score: score,
      notes: notes || null,
      completed_at: new Date().toISOString(),
    }).eq("id", inspectionId);

    if (error) {
      console.error("Failed to submit inspection:", error);
      return;
    }

    // Update local state
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
  }, []);

  // Still loading auth — brief spinner (usually < 500ms)
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Not authenticated — redirect
  if (!authUser) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  // No data yet (shouldn't happen, but safety net)
  if (!data) {
    return null;
  }

  const t_fn = (key: TranslationKey) => translate(key, lang);

  return (
    <DemoContext.Provider
      value={{
        data,
        user: authUser!,
        role: data.currentRole,
        lang,
        setRole,
        setLang,
        updateData,
        refresh,
        reset,
        t: t_fn,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export { generateId };
