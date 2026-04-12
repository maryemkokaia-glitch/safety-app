/**
 * Fix Georgian text encoding in Supabase database.
 *
 * The original SQL migrations may have been run with incorrect encoding,
 * causing Georgian text to appear as mojibake. This script re-writes
 * all template and regulation text using the Supabase JS client which
 * properly handles UTF-8.
 *
 * Usage: node scripts/fix-encoding.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Correct Georgian template data
const templates = [
  { id: "11111111-1111-1111-1111-111111111111", name: "ფასადის ხარაჩოების ყოველკვირეული შემოწმება", category: "scaffold_fixed" },
  { id: "22222222-2222-2222-2222-222222222222", name: "მოძრავი ხარაჩოების შემოწმება", category: "scaffold_mobile" },
  { id: "33333333-3333-3333-3333-333333333333", name: "ჩამოკიდებული ხარაჩოების შემოწმება", category: "scaffold_suspended" },
  { id: "44444444-4444-4444-4444-444444444444", name: "უსაფრთხოების აღკაზმულობის შემოწმება", category: "harness_ppe" },
  { id: "55555555-5555-5555-5555-555555555555", name: "ტექნიკური აღჭურვილობის შემოწმება", category: "equipment" },
  { id: "66666666-6666-6666-6666-666666666666", name: "პირადი დამცავი აღჭურვილობის შემოწმება", category: "ppe_general" },
];

const templateItems = {
  "11111111-1111-1111-1111-111111111111": [
    { text: "საანკერე სამაგრები სწორად არის დამონტაჟებული", order_index: 1, is_critical: true },
    { text: "პლატფორმის სიგანე ≥ 80 სმ", order_index: 2, is_critical: true },
    { text: "პლატფორმის სტაბილურობა (მყარი და დაცული)", order_index: 3, is_critical: true },
    { text: "ხარაჩოსა და შენობას შორის უსაფრთხო მანძილი", order_index: 4, is_critical: false },
    { text: "მოაჯირები დამონტაჟებულია (სწორი რაოდენობა)", order_index: 5, is_critical: true },
    { text: "ვერტიკალურ საყრდენებს შორის სწორი მანძილი", order_index: 6, is_critical: false },
    { text: "ხარაჩო მყარ ზედაპირზეა განთავსებული", order_index: 7, is_critical: true },
    { text: "არ არის ხილული დაზიანება ან დეფორმაცია", order_index: 8, is_critical: true },
    { text: "უსაფრთხო წვდომა (კიბეები/საფეხურები დამონტაჟებულია)", order_index: 9, is_critical: true },
  ],
  "22222222-2222-2222-2222-222222222222": [
    { text: "ბორბლები ფუნქციონირებს და იბლოკება", order_index: 1, is_critical: true },
    { text: "მუხრუჭები მუშაობს", order_index: 2, is_critical: true },
    { text: "კონსტრუქცია სტაბილურია", order_index: 3, is_critical: true },
    { text: "მოაჯირები დამონტაჟებულია", order_index: 4, is_critical: true },
    { text: "გადაადგილება მხოლოდ ცარიელ მდგომარეობაში", order_index: 5, is_critical: false },
    { text: "ზედაპირი უსაფრთხოა", order_index: 6, is_critical: false },
    { text: "არ არის სტრუქტურული დაზიანება", order_index: 7, is_critical: true },
  ],
  "33333333-3333-3333-3333-333333333333": [
    { text: "შეწყვეტის სისტემა დაცულია", order_index: 1, is_critical: true },
    { text: "ბაგირები/თოკები დაუზიანებელია", order_index: 2, is_critical: true },
    { text: "დატვირთვის მოცულობა დაცულია", order_index: 3, is_critical: true },
    { text: "უსაფრთხოების საკეტები მუშაობს", order_index: 4, is_critical: true },
    { text: "პლატფორმის სტაბილურობა", order_index: 5, is_critical: true },
    { text: "საგანგებო სისტემები ხელმისაწვდომია", order_index: 6, is_critical: true },
    { text: "მუშები იყენებენ აღკაზმულობას", order_index: 7, is_critical: true },
  ],
  "44444444-4444-4444-4444-444444444444": [
    { text: "არ არის ხილული დაზიანება", order_index: 1, is_critical: true },
    { text: "კაუჭები/კონექტორები ფუნქციონირებს", order_index: 2, is_critical: true },
    { text: "მოქმედი შემოწმების ნიშანი", order_index: 3, is_critical: true },
    { text: "სწორი მორგება", order_index: 4, is_critical: false },
    { text: "სწორი გამოყენება", order_index: 5, is_critical: false },
  ],
  "55555555-5555-5555-5555-555555555555": [
    { text: "აღჭურვილობის მდგომარეობა კარგია", order_index: 1, is_critical: false },
    { text: "არ არის დაზიანება ან გაშიშვლებული მავთულები", order_index: 2, is_critical: true },
    { text: "უსაფრთხოების ფარები დამონტაჟებულია", order_index: 3, is_critical: true },
    { text: "სწორი გამოყენება", order_index: 4, is_critical: false },
    { text: "ტექნიკური მომსახურება შესრულებულია", order_index: 5, is_critical: false },
  ],
  "66666666-6666-6666-6666-666666666666": [
    { text: "PPE ატარია ყველა მუშას", order_index: 1, is_critical: true },
    { text: "კარგ მდგომარეობაშია", order_index: 2, is_critical: false },
    { text: "არ არის დაზიანებული", order_index: 3, is_critical: true },
    { text: "შესაფერისია დავალებისთვის", order_index: 4, is_critical: false },
    { text: "სუფთა და გამოსაყენებელი", order_index: 5, is_critical: false },
  ],
};

async function fixTemplates() {
  console.log("Fixing template names...");
  for (const tmpl of templates) {
    const { error } = await supabase
      .from("checklist_templates")
      .update({ name: tmpl.name })
      .eq("id", tmpl.id);
    if (error) console.error(`  Failed ${tmpl.id}:`, error.message);
    else console.log(`  ✓ ${tmpl.name}`);
  }
}

async function fixTemplateItems() {
  console.log("\nFixing template items...");
  for (const [templateId, items] of Object.entries(templateItems)) {
    // Get existing items for this template
    const { data: existing } = await supabase
      .from("checklist_template_items")
      .select("id, order_index")
      .eq("template_id", templateId)
      .order("order_index");

    if (!existing || existing.length === 0) {
      console.log(`  ⚠ No items found for template ${templateId}`);
      continue;
    }

    for (const item of items) {
      const match = existing.find((e) => e.order_index === item.order_index);
      if (match) {
        const { error } = await supabase
          .from("checklist_template_items")
          .update({ text: item.text })
          .eq("id", match.id);
        if (error) console.error(`  Failed item ${match.id}:`, error.message);
        else console.log(`  ✓ [${item.order_index}] ${item.text.substring(0, 40)}...`);
      }
    }
  }
}

async function main() {
  console.log("=== Fixing Georgian text encoding in Supabase ===\n");
  await fixTemplates();
  await fixTemplateItems();
  console.log("\n✅ Done! Refresh the app to see correct Georgian text.");
}

main().catch(console.error);
