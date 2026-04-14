import type { AppData } from "../store";
import { createClient } from "./client";

export function syncTemplateChanges(prev: AppData, next: AppData) {
  const supabase = createClient();

  const prevIds = new Set(prev.templates.map((t) => t.id));
  const nextIds = new Set(next.templates.map((t) => t.id));

  for (const tmpl of next.templates) {
    if (!prevIds.has(tmpl.id)) {
      supabase.from("checklist_templates").insert({
        id: tmpl.id, name: tmpl.name, category: tmpl.category, company_id: tmpl.company_id,
      }).then(({ error }) => { if (error) console.error("Insert template:", error.message); });

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

    const prevTmpl = prev.templates.find((t) => t.id === tmpl.id);
    if (prevTmpl && prevTmpl.name !== tmpl.name) {
      supabase.from("checklist_templates").update({ name: tmpl.name }).eq("id", tmpl.id)
        .then(({ error }) => { if (error) console.error("Update template name:", error.message); });
    }

    if (!prevTmpl) continue;

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

    const nextItemIds = new Set(tmpl.items.map((i) => i.id));
    for (const item of prevTmpl.items) {
      if (!nextItemIds.has(item.id)) {
        supabase.from("checklist_template_items").delete().eq("id", item.id)
          .then(({ error }) => { if (error) console.error("Delete item:", error.message); });
      }
    }

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

  for (const tmpl of prev.templates) {
    if (!nextIds.has(tmpl.id)) {
      supabase.from("checklist_template_items").delete().eq("template_id", tmpl.id)
        .then(() => supabase.from("checklist_templates").delete().eq("id", tmpl.id))
        .then(({ error }: any) => { if (error) console.error("Delete template:", error.message); });
    }
  }
}
