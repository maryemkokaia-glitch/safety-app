import type { AppData } from "../store";
import type { User } from "../database.types";
import { createClient } from "./client";

type SetData = (updater: (prev: AppData | null) => AppData | null) => void;

export function createMutations(authUser: User | null, setData: SetData) {
  const supabase = createClient();

  async function createInspection(projectId: string, templateId: string): Promise<string | null> {
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

    setData((prev) => {
      if (!prev) return prev;
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
          return { ...item, comment: null, measured_value: null, template_item: tmplItem || null, photos: [] };
        }),
      };
      return { ...prev, inspections: [newInspection as any, ...prev.inspections] };
    });

    return inspId;
  }

  async function updateInspectionItem(itemId: string, fields: Record<string, any>) {
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

    supabase.from("inspection_items").update(fields).eq("id", itemId)
      .then(({ error }) => { if (error) console.error("Failed to update item:", error); });
  }

  async function uploadPhoto(itemId: string, file: File) {
    const photoId = crypto.randomUUID();
    const path = `${authUser?.id}/${itemId}/${photoId}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("inspection-photos")
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      console.error("Failed to upload photo:", uploadError);
      return;
    }

    const { data: urlData } = supabase.storage.from("inspection-photos").getPublicUrl(path);
    const photoUrl = urlData.publicUrl;

    supabase.from("inspection_photos").insert({
      id: photoId, inspection_item_id: itemId, photo_url: photoUrl, taken_at: new Date().toISOString(),
    }).then(({ error }) => { if (error) console.error("Failed to save photo record:", error); });

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
            ? { ...item, photos: [...(item.photos || []), { id: photoId, inspection_item_id: itemId, photo_url: photoUrl, caption: null, taken_at: new Date().toISOString() }] }
            : item
        ),
      };
      return { ...prev, inspections };
    });
  }

  async function removePhoto(photoId: string, itemId: string) {
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
          item.id === itemId ? { ...item, photos: (item.photos || []).filter((p) => p.id !== photoId) } : item
        ),
      };
      return { ...prev, inspections };
    });

    supabase.from("inspection_photos").delete().eq("id", photoId);
  }

  async function submitInspection(inspectionId: string, notes: string, score: number) {
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

    supabase.from("inspections").update({
      status: "completed", safety_score: score, notes: notes || null, completed_at: new Date().toISOString(),
    }).eq("id", inspectionId).then(({ error }) => {
      if (error) console.error("Failed to submit inspection:", error);
    });
  }

  return { createInspection, updateInspectionItem, uploadPhoto, removePhoto, submitInspection };
}
