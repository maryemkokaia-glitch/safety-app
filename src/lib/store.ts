"use client";

import { ChecklistTemplate, ChecklistTemplateItem, Inspection, InspectionItem, InspectionPhoto, Project, Regulation, User, Notification, UserRole, TemplateWithItems, InspectionWithItems } from "./database.types";

// =============================================
// Demo Data Store — everything in localStorage
// =============================================

const STORAGE_KEY = "safety_app_data";
export const DEMO_COMPANY_ID = "company-1";

export interface AppData {
  lang: "ka" | "en";
  currentRole: UserRole;
  currentUser: User;
  projects: Project[];
  templates: TemplateWithItems[];
  inspections: InspectionWithItems[];
  regulations: Regulation[];
  notifications: Notification[];
  users: User[];
}

// Demo Users
const demoAdmin: User = {
  id: "admin-1",
  email: "admin@demo.ge",
  full_name: "გიორგი ადმინისტრატორი",
  phone: "+995 555 123456",
  role: "admin",
  company_id: "company-1",
  avatar_url: null,
  created_at: new Date().toISOString(),
};

const demoInspector: User = {
  id: "inspector-1",
  email: "inspector@demo.ge",
  full_name: "ნიკა ინსპექტორი",
  phone: "+995 555 654321",
  role: "inspector",
  company_id: "company-1",
  avatar_url: null,
  created_at: new Date().toISOString(),
};

const demoClient: User = {
  id: "client-1",
  email: "client@demo.ge",
  full_name: "თამარ კლიენტი",
  phone: "+995 555 111222",
  role: "client",
  company_id: null,
  avatar_url: null,
  created_at: new Date().toISOString(),
};

// Demo Projects
const demoProjects: Project[] = [
  { id: "proj-1", company_id: "company-1", name: "საცხოვრებელი კომპლექსი ვაკეში", address: "ჭავჭავაძის 45, თბილისი", status: "active", client_id: "client-1", inspector_id: "inspector-1", created_at: "2024-01-15T10:00:00Z" },
  { id: "proj-2", company_id: "company-1", name: "ოფისის მშენებლობა საბურთალოზე", address: "პეკინის 12, თბილისი", status: "active", client_id: "client-1", inspector_id: "inspector-1", created_at: "2024-02-20T10:00:00Z" },
  { id: "proj-3", company_id: "company-1", name: "სავაჭრო ცენტრი გლდანში", address: "ხიზანიშვილის 8, თბილისი", status: "paused", client_id: null, inspector_id: null, created_at: "2024-03-10T10:00:00Z" },
];

// Checklist Templates with items
const demoTemplates: TemplateWithItems[] = [
  {
    id: "tmpl-1", name: "ფასადის ხარაჩოების ყოველკვირეული შემოწმება", category: "scaffold_fixed", company_id: null, created_at: "2024-01-01T00:00:00Z",
    items: [
      { id: "ti-1-1", template_id: "tmpl-1", text: "საანკერე სამაგრები სწორად არის დამონტაჟებული", order_index: 1, is_critical: true },
      { id: "ti-1-2", template_id: "tmpl-1", text: "პლატფორმის სიგანე >= 80 სმ", order_index: 2, is_critical: true },
      { id: "ti-1-3", template_id: "tmpl-1", text: "პლატფორმის სტაბილურობა (მყარი და დაცული)", order_index: 3, is_critical: true },
      { id: "ti-1-4", template_id: "tmpl-1", text: "ხარაჩოსა და შენობას შორის უსაფრთხო მანძილი", order_index: 4, is_critical: false },
      { id: "ti-1-5", template_id: "tmpl-1", text: "მოაჯირები დამონტაჟებულია (სწორი რაოდენობა)", order_index: 5, is_critical: true },
      { id: "ti-1-6", template_id: "tmpl-1", text: "ვერტიკალურ საყრდენებს შორის სწორი მანძილი", order_index: 6, is_critical: false },
      { id: "ti-1-7", template_id: "tmpl-1", text: "ხარაჩო მყარ ზედაპირზეა განთავსებული", order_index: 7, is_critical: true },
      { id: "ti-1-8", template_id: "tmpl-1", text: "არ არის ხილული დაზიანება ან დეფორმაცია", order_index: 8, is_critical: true },
      { id: "ti-1-9", template_id: "tmpl-1", text: "უსაფრთხო წვდომა (კიბეები/საფეხურები დამონტაჟებულია)", order_index: 9, is_critical: true },
    ],
  },
  {
    id: "tmpl-2", name: "მოძრავი ხარაჩოების შემოწმება", category: "scaffold_mobile", company_id: null, created_at: "2024-01-01T00:00:00Z",
    items: [
      { id: "ti-2-1", template_id: "tmpl-2", text: "ბორბლები ფუნქციონირებს და იბლოკება", order_index: 1, is_critical: true },
      { id: "ti-2-2", template_id: "tmpl-2", text: "მუხრუჭები მუშაობს", order_index: 2, is_critical: true },
      { id: "ti-2-3", template_id: "tmpl-2", text: "კონსტრუქცია სტაბილურია", order_index: 3, is_critical: true },
      { id: "ti-2-4", template_id: "tmpl-2", text: "მოაჯირები დამონტაჟებულია", order_index: 4, is_critical: true },
      { id: "ti-2-5", template_id: "tmpl-2", text: "გადაადგილება მხოლოდ ცარიელ მდგომარეობაში", order_index: 5, is_critical: false },
      { id: "ti-2-6", template_id: "tmpl-2", text: "ზედაპირი უსაფრთხოა", order_index: 6, is_critical: false },
      { id: "ti-2-7", template_id: "tmpl-2", text: "არ არის სტრუქტურული დაზიანება", order_index: 7, is_critical: true },
    ],
  },
  {
    id: "tmpl-3", name: "ჩამოკიდებული ხარაჩოების შემოწმება", category: "scaffold_suspended", company_id: null, created_at: "2024-01-01T00:00:00Z",
    items: [
      { id: "ti-3-1", template_id: "tmpl-3", text: "შეწყვეტის სისტემა დაცულია", order_index: 1, is_critical: true },
      { id: "ti-3-2", template_id: "tmpl-3", text: "ბაგირები/თოკები დაუზიანებელია", order_index: 2, is_critical: true },
      { id: "ti-3-3", template_id: "tmpl-3", text: "დატვირთვის მოცულობა დაცულია", order_index: 3, is_critical: true },
      { id: "ti-3-4", template_id: "tmpl-3", text: "უსაფრთხოების საკეტები მუშაობს", order_index: 4, is_critical: true },
      { id: "ti-3-5", template_id: "tmpl-3", text: "პლატფორმის სტაბილურობა", order_index: 5, is_critical: true },
      { id: "ti-3-6", template_id: "tmpl-3", text: "საგანგებო სისტემები ხელმისაწვდომია", order_index: 6, is_critical: true },
      { id: "ti-3-7", template_id: "tmpl-3", text: "მუშები იყენებენ აღკაზმულობას", order_index: 7, is_critical: true },
    ],
  },
  {
    id: "tmpl-4", name: "უსაფრთხოების აღკაზმულობის შემოწმება", category: "harness_ppe", company_id: null, created_at: "2024-01-01T00:00:00Z",
    items: [
      { id: "ti-4-1", template_id: "tmpl-4", text: "არ არის ხილული დაზიანება", order_index: 1, is_critical: true },
      { id: "ti-4-2", template_id: "tmpl-4", text: "კაუჭები/კონექტორები ფუნქციონირებს", order_index: 2, is_critical: true },
      { id: "ti-4-3", template_id: "tmpl-4", text: "მოქმედი შემოწმების ნიშანი", order_index: 3, is_critical: true },
      { id: "ti-4-4", template_id: "tmpl-4", text: "სწორი მორგება", order_index: 4, is_critical: false },
      { id: "ti-4-5", template_id: "tmpl-4", text: "სწორი გამოყენება", order_index: 5, is_critical: false },
    ],
  },
  {
    id: "tmpl-5", name: "ტექნიკური აღჭურვილობის შემოწმება", category: "equipment", company_id: null, created_at: "2024-01-01T00:00:00Z",
    items: [
      { id: "ti-5-1", template_id: "tmpl-5", text: "აღჭურვილობის მდგომარეობა კარგია", order_index: 1, is_critical: false },
      { id: "ti-5-2", template_id: "tmpl-5", text: "არ არის დაზიანება ან გაშიშვლებული მავთულები", order_index: 2, is_critical: true },
      { id: "ti-5-3", template_id: "tmpl-5", text: "უსაფრთხოების ფარები დამონტაჟებულია", order_index: 3, is_critical: true },
      { id: "ti-5-4", template_id: "tmpl-5", text: "სწორი გამოყენება", order_index: 4, is_critical: false },
      { id: "ti-5-5", template_id: "tmpl-5", text: "ტექნიკური მომსახურება შესრულებულია", order_index: 5, is_critical: false },
    ],
  },
  {
    id: "tmpl-6", name: "პირადი დამცავი აღჭურვილობის შემოწმება", category: "ppe_general", company_id: null, created_at: "2024-01-01T00:00:00Z",
    items: [
      { id: "ti-6-1", template_id: "tmpl-6", text: "PPE ატარია ყველა მუშას", order_index: 1, is_critical: true },
      { id: "ti-6-2", template_id: "tmpl-6", text: "კარგ მდგომარეობაშია", order_index: 2, is_critical: false },
      { id: "ti-6-3", template_id: "tmpl-6", text: "არ არის დაზიანებული", order_index: 3, is_critical: true },
      { id: "ti-6-4", template_id: "tmpl-6", text: "შესაფერისია დავალებისთვის", order_index: 4, is_critical: false },
      { id: "ti-6-5", template_id: "tmpl-6", text: "სუფთა და გამოსაყენებელი", order_index: 5, is_critical: false },
    ],
  },
  {
    id: "tmpl-7", name: "ფიზიკური ფაქტორების შემოწმება (მიკროკლიმატი)", category: "physical_factors" as any, company_id: null, created_at: "2024-01-01T00:00:00Z",
    items: [
      { id: "ti-7-1", template_id: "tmpl-7", text: "ფარდობითი ტენიანობა", order_index: 1, is_critical: false, input_type: "measurement" as const, unit: "%RH", norm_min: 40, norm_max: 60 },
      { id: "ti-7-2", template_id: "tmpl-7", text: "ჰაერის ტემპერატურა", order_index: 2, is_critical: false, input_type: "measurement" as const, unit: "°C", norm_min: 20, norm_max: 22 },
      { id: "ti-7-3", template_id: "tmpl-7", text: "ხმაურის დონე", order_index: 3, is_critical: true, input_type: "measurement" as const, unit: "dB", norm_min: null, norm_max: 80 },
      { id: "ti-7-4", template_id: "tmpl-7", text: "განათება", order_index: 4, is_critical: false, input_type: "measurement" as const, unit: "ლუქსი", norm_min: 500, norm_max: null },
      { id: "ti-7-5", template_id: "tmpl-7", text: "ჰაერის მოძრაობის სიჩქარე", order_index: 5, is_critical: false, input_type: "measurement" as const, unit: "მ/წმ", norm_min: 0.1, norm_max: null },
    ],
  },
];

// Real Georgian Safety Regulations from matsne.gov.ge
const demoRegulations: Regulation[] = [
  // === მუშათა უსაფრთხოება (Worker Safety) ===
  { id: "reg-1", title: "დამსაქმებლის ვალდებულებები — მუხლი 5, ორგანული კანონი", content: "დამსაქმებელი ვალდებულია: უზრუნველყოს უსაფრთხოების ნორმების დაცვა; აღკვეთოს ზიანის მიყენება დასაქმებულისთვის; აკონტროლოს მავნე ფაქტორები; აწარმოოს უბედური შემთხვევებისა და პროფესიული დაავადებების აღრიცხვა; რეგულარულად შეამოწმოს აღჭურვილობა; უზრუნველყოს დამცავი აღჭურვილობა; ჩაატაროს მუშათა ტრენინგი სამუშაო საათებში დამსაქმებლის ხარჯით; აიღოს საუბედურო შემთხვევოთა დაზღვევა. უსაფრთხოებასთან დაკავშირებული ყველა ხარჯი ეკისრება დამსაქმებელს.", category: "worker_safety", source_url: "https://matsne.gov.ge/ka/document/view/4486188", effective_date: "2019-09-01", tags: ["დამსაქმებელი", "ვალდებულება", "ტრენინგი", "დაზღვევა"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-2", title: "რისკის შეფასება — მუხლი 6, ორგანული კანონი", content: "დამსაქმებელი ვალდებულია შეაფასოს სამუშაო ადგილის რისკები საერთაშორისო სტანდარტების შესაბამისად. უნდა შეიმუშაოს პრევენციის ყოვლისმომცველი პოლიტიკა, შეინახოს რისკის შეფასების დოკუმენტაცია. კოლექტიური დაცვის ზომებს უპირატესობა ენიჭება ინდივიდუალურ დაცვასთან შედარებით. სამუშაო უნდა მოერგოს ინდივიდუალურ შესაძლებლობებს.", category: "worker_safety", source_url: "https://matsne.gov.ge/ka/document/view/4486188", effective_date: "2019-09-01", tags: ["რისკი", "შეფასება", "პრევენცია", "დოკუმენტაცია"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-3", title: "შრომის უსაფრთხოების სპეციალისტი — მუხლი 7", content: "დამსაქმებელმა უნდა დაასაქმოს შრომის უსაფრთხოების სპეციალისტი ან შექმნას უსაფრთხოების სამსახური: 20-მდე მუშაკის შემთხვევაში — დამსაქმებელს შეუძლია თავად შეასრულოს ფუნქცია (ტრენინგის გავლის შემდეგ); 20-100 მუშაკი — მინიმუმ 1 სპეციალისტი; 100+ მუშაკი — უსაფრთხოების სამსახური მინიმუმ 2 სპეციალისტით. სპეციალისტს უნდა ჰქონდეს აკრედიტებული პროგრამის სერტიფიკატი.", category: "worker_safety", source_url: "https://matsne.gov.ge/ka/document/view/4486188", effective_date: "2019-09-01", tags: ["სპეციალისტი", "სამსახური", "სერტიფიკატი"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-4", title: "სიმაღლეზე მუშაობა — მუხლი 10, დადგენილება №62", content: "სიმაღლეზე მუშაობისას: 5 მეტრზე მაღალ ლითონის კიბეებს უნდა ჰქონდეს ვერტიკალური მოაჯირები ფოლადის რკალებით. აკრძალულია სამონტაჟო სამუშაოები 15 მ/წმ-ზე მეტი ქარის დროს, ნისლის ან ჭექა-ქუხილის პირობებში. პანელებისა და კონსტრუქციების გადაადგილება აკრძალულია 10 მ/წმ-ზე მეტი ქარის დროს. სამუშაოს შეწყვეტისას ელემენტების დაკიდებულ მდგომარეობაში დატოვება დაუშვებელია.", category: "worker_safety", source_url: "https://matsne.gov.ge/ka/document/view/9406", effective_date: "2007-04-02", tags: ["სიმაღლე", "ქარი", "კიბე", "მონტაჟი"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-5", title: "პირველადი დახმარება და ევაკუაცია — მუხლი 8", content: "დამსაქმებელი ვალდებულია განახორციელოს ზომები პირველადი დახმარების, სახანძრო უსაფრთხოებისა და ევაკუაციისთვის, სამუშაო ადგილის ზომის შესაბამისად. გაზრდილი საფრთხის შემთხვევაში დამსაქმებელმა დაუყოვნებლივ უნდა აცნობოს ყველა დაზარალებულ პირს, მიიღოს ყველა საჭირო დამცავი ზომა, გასცეს სამუშაოს შეწყვეტის ბრძანება. მუშაკები ვალდებულნი არ არიან განაგრძონ მუშაობა გაზრდილი საფრთხის პირობებში.", category: "worker_safety", source_url: "https://matsne.gov.ge/ka/document/view/4486188", effective_date: "2019-09-01", tags: ["პირველადი დახმარება", "ევაკუაცია", "სახანძრო", "საფრთხე"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-6", title: "დასაქმებულის უფლებები — მუხლი 10", content: "დასაქმებულს უფლება აქვს: განიხილოს უსაფრთხოების საკითხები დამსაქმებელთან; მიიღოს ინფორმაცია საფრთხეებისა და რისკების შეფასების შესახებ; უარი თქვას სამუშაოზე, რომელიც აშკარა არსებით საფრთხეს უქმნის სიცოცხლეს/ჯანმრთელობას; მოითხოვოს სამუშაო ადგილის შეცვლა სამედიცინო ჩვენების შემთხვევაში; მიიღოს კომპენსაცია სამუშაო ადგილზე დაზიანებისთვის. აკრძალულია დასაქმებულის გათავისუფლება ამ უფლებების გამოყენებისთვის.", category: "worker_safety", source_url: "https://matsne.gov.ge/ka/document/view/4486188", effective_date: "2019-09-01", tags: ["უფლებები", "უარის თქმა", "კომპენსაცია"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-7", title: "PPE — ინდივიდუალური დაცვის საშუალებები, დადგენილება №82", content: "PPE იყოფა 3 კატეგორიად: I კატეგორია (დაბალი რისკი) — ზედაპირული მექანიკური დაზიანება, 50°C-მდე ზედაპირთან კონტაქტი; II კატეგორია (საშუალო რისკი); III კატეგორია (მაღალი რისკი) — ჯანმრთელობისთვის საშიში ნივთიერებები, ჟანგბადის ნაკლებობა, სიმაღლიდან ვარდნა, ელექტროშოკი, დახრჩობა, მავნე ხმაური. ჩაფხუტი უნდა უზრუნველყოფდეს დარტყმის ადეკვატურ შთანთქმას. სამაგრი აღკაზმულობა უნდა ამცირებდეს ვერტიკალური ვარდნის მანძილს.", category: "worker_safety", source_url: "https://matsne.gov.ge/ka/document/view/4793418", effective_date: "2020-02-06", tags: ["PPE", "ჩაფხუტი", "აღკაზმულობა", "კატეგორია"], created_at: "2024-01-01T00:00:00Z" },

  // === აღჭურვილობის უსაფრთხოება (Equipment Safety) ===
  { id: "reg-8", title: "ხარაჩოების უსაფრთხოება — მუხლი 3, დადგენილება №62", content: "ხარაჩოები უნდა დამონტაჟდეს პროექტის სპეციფიკაციების შესაბამისად, დატვირთვის მოცულობის გათვალისწინებით. ქარხნულად წარმოებული ხარაჩოები საჭიროებს მწარმოებლის მონტაჟის ინსტრუქციას. დემონტაჟის დროს უნდა კონტროლდებოდეს პირველი სართული, ყველა კარის ღიობი და ზედა სართულების გასასვლელები. აკრძალულია თვითნაკეთი ნაწილების ან შეკეთების გამოყენება.", category: "equipment_safety", source_url: "https://matsne.gov.ge/ka/document/view/9406", effective_date: "2007-04-02", tags: ["ხარაჩო", "მონტაჟი", "დემონტაჟი", "დატვირთვა"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-9", title: "ამწე მოწყობილობები და მანქანა-მექანიზმები — მუხლი 4", content: "მანქანა-მექანიზმების ექსპლუატაცია უნდა მოხდეს მწარმოებლის ინსტრუქციის შესაბამისად. მექანიზმების მუშაობის ზონაში უნდა განთავსდეს გამაფრთხილებელი ნიშნები. ელექტრო მანქანა-მექანიზმები საჭიროებს ძაბვის კონტროლის დაცვას ტექნიკური მომსახურების დროს. რთული რელიეფის პირობებში საჭიროა საფრთხის შეფასება და პრევენციული ზომები.", category: "equipment_safety", source_url: "https://matsne.gov.ge/ka/document/view/9406", effective_date: "2007-04-02", tags: ["ამწე", "კრანი", "მექანიზმი", "ძაბვა"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-10", title: "ელექტრო აღჭურვილობის უსაფრთხოება — მუხლი 14", content: "წრედის მოულოდნელი ჩართვის თავიდან აცილება უნდა მოხდეს ავტომატური ამომრთველების გათიშვით/მოხსნით. კაბელების გაყვანა უნდა მოხდეს პროექტის სპეციფიკაციების შესაბამისად. არსებული კაბელები საჭიროებს გათიშვას და დამიწებას. საჰაერო ხაზის მონტაჟი მოითხოვს სათანადო დამიწებას. ყველა ელექტრო ხელსაწყოს უნდა ჰქონდეს დამცავი ფარი.", category: "equipment_safety", source_url: "https://matsne.gov.ge/ka/document/view/9406", effective_date: "2007-04-02", tags: ["ელექტრო", "კაბელი", "დამიწება", "ავტომატი"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-11", title: "შედუღების სამუშაოები — მუხლი 15", content: "აღჭურვილობის იზოლაცია უნდა შემოწმდეს გამოყენებამდე. მაღალი ძაბვის ელემენტები საიმედოდ უნდა იყოს დაფარული. წვიმისა და თოვლის დროს მუშაობა აკრძალულია ამინდისგან დაცვის გარეშე. დახურულ სივრცეებში საჭიროა ვენტილაცია. გაზის ბალონები უნდა ინახებოდეს ცალ-ცალკე (სავსე/ცარიელი); დაცული უნდა იყოს დარტყმისგან და პირდაპირი მზის სხივებისგან, 1 მ-ზე მეტ მანძილზე სითბოს წყაროებიდან.", category: "equipment_safety", source_url: "https://matsne.gov.ge/ka/document/view/9406", effective_date: "2007-04-02", tags: ["შედუღება", "გაზი", "ბალონი", "ვენტილაცია"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-12", title: "ტვირთის აწევა-გადატანა — მუხლი 5", content: "ტვირთი უნდა დამაგრდეს მხოლოდ ქარხნული აღჭურვილობით (არა იმპროვიზირებული). დამაგრებული ტვირთი უნდა უზრუნველყოფდეს სტაბილურ ტრანსპორტირებას და კონტროლირებულ გადმოტვირთვას. ასაწყობი ელემენტების აღჭურვილობა უნდა შემოწმდეს და მორგებულ იქნას გამოყენებამდე. სატრანსპორტო საშუალების კაბინის დაცვა სავალდებულოა ამწე მექანიზმების გამოყენებისას.", category: "equipment_safety", source_url: "https://matsne.gov.ge/ka/document/view/9406", effective_date: "2007-04-02", tags: ["ტვირთი", "ამწე", "დამაგრება", "ტრანსპორტი"], created_at: "2024-01-01T00:00:00Z" },

  // === ობიექტის უსაფრთხოება (Site Safety) ===
  { id: "reg-13", title: "სამშენებლო ობიექტის ორგანიზება — მუხლი 2", content: "დასახლებულ ტერიტორიებზე ობიექტი უნდა იყოს შემოღობილი კონტროლირებადი წვდომით. ქვეითად მოსიარულეთა ტრაფიკთან ღობეს უნდა ჰქონდეს დამცავი საფარი. ღამით საჭიროა განათება სასიგნალო ნათურებით ან ამრეკლავი მასალებით. ჭაბურღილები, ორმოები და კიბის უჯრედები უნდა იყოს დაფარული ან შემოღობილი. განსაკუთრებით საშიში ზონა უნდა აღინიშნოს დამცავი ბარიერებითა და გამაფრთხილებელი ნიშნებით.", category: "site_safety", source_url: "https://matsne.gov.ge/ka/document/view/9406", effective_date: "2007-04-02", tags: ["ღობე", "განათება", "ბარიერი", "ნიშანი"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-14", title: "სახანძრო უსაფრთხოება სამშენებლო ობიექტზე", content: "სამშენებლო ობიექტზე სავალდებულოა: ცეცხლმაქრები ყოველ სექციაში; საევაკუაციო მარშრუტების მკაფიო მონიშვნა; ცეცხლსაწინააღმდეგო აღჭურვილობა ცხელი სამუშაოების ზონებში. მიწისქვეშა სამუშაოების ყველა სექცია უნდა იყოს აღჭურვილი საგანგებო მარაგებითა და ცეცხლმაქრებით. ფეთქებადი ატმოსფეროს პირობებში სავალდებულოა არაფეთქებადი ელექტრო აღჭურვილობის გამოყენება.", category: "site_safety", source_url: "https://matsne.gov.ge/ka/document/view/9406", effective_date: "2007-04-02", tags: ["ხანძარი", "ცეცხლმაქრი", "ევაკუაცია", "ცხელი სამუშაო"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-15", title: "მიწის სამუშაოები — მუხლი 6", content: "მიწის სამუშაოების დაწყებამდე უნდა განისაზღვროს მიწისქვეშა კომუნიკაციების მდებარეობა. აქტიური კაბელებისა და გაზსადენების მახლობლად მუშაობა მოითხოვს პასუხისმგებელი პირის ზედამხედველობას და კომუნალური ოპერატორის თანხმობას. ხვრეტების, ორმოებისა და ტრანშეების შემოღობვა და მონიშვნა სავალდებულოა.", category: "site_safety", source_url: "https://matsne.gov.ge/ka/document/view/9406", effective_date: "2007-04-02", tags: ["მიწა", "კომუნიკაციები", "კაბელი", "გაზი"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-16", title: "სახურავის სამუშაოები — მუხლი 11", content: "სახურავის მზიდი კონსტრუქციების მდგრადობა უნდა შემოწმდეს მუშაკების დაშვებამდე. მასალის დაწყობა დასაშვებია მხოლოდ პროექტით განსაზღვრულ ადგილებში. სამუშაო აკრძალულია ნისლის დროს და 15 მ/წმ-ზე მეტი ქარის პირობებში. აღჭურვილობა, ინსტრუმენტი და მასალები სამუშაოს შეწყვეტისას უნდა დამაგრდეს ან აიღოს სახურავიდან.", category: "site_safety", source_url: "https://matsne.gov.ge/ka/document/view/9406", effective_date: "2007-04-02", tags: ["სახურავი", "ქარი", "მზიდი", "მასალა"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-17", title: "შენობის დემონტაჟი — მუხლი 17", content: "სამუშაოს დაწყებამდე უნდა გაითიშოს ყველა კომუნიკაცია: წყალი, გათბობა, გაზი, ელექტრო, კანალიზაცია. აკრძალულია ერთდროული დემონტაჟი რამდენიმე სართულზე. სფერული ანგრევის დროს მუშაკებს უნდა დაშორდნენ შენობის სიმაღლეზე მეტ მანძილზე. აღჭურვილობა უნდა განთავსდეს დემონტაჟის ზონის გარეთ.", category: "site_safety", source_url: "https://matsne.gov.ge/ka/document/view/9406", effective_date: "2007-04-02", tags: ["დემონტაჟი", "კომუნიკაცია", "გათიშვა", "ზონა"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-18", title: "ინსპექციის წესები და ჯარიმები — კანონი შრომის ინსპექციის შესახებ", content: "შრომის ინსპექტორს უფლება აქვს: შევიდეს სამუშაო ადგილზე წინასწარი შეტყობინების გარეშე, დღე-ღამის ნებისმიერ დროს; მოითხოვოს დოკუმენტები და ინფორმაცია; აიღოს მასალების ნიმუშები; ჩაატაროს ფოტო და ვიდეო გადაღება. სანქციები: გაფრთხილება; ჯარიმა; სამუშაო პროცესის შეჩერება. გადაუხდელი ჯარიმის შემთხვევაში ჯარიმა ორმაგდება. რეგისტრაციის გარეშე საშიში საქმიანობა — 1,000 ლარი ჯარიმა; შეუსრულებლობა — 2,000 ლარი.", category: "site_safety", source_url: "https://matsne.gov.ge/ka/document/view/5003057", effective_date: "2020-01-01", tags: ["ინსპექცია", "ჯარიმა", "შეჩერება", "ინსპექტორი"], created_at: "2024-01-01T00:00:00Z" },

  // === დადგენილებები (Government Decrees) ===
  { id: "reg-19", title: "დადგენილება №477 — სიმაღლეზე მუშაობის უსაფრთხოების ტექნიკური რეგლამენტი", content: "ტექნიკური რეგლამენტი ადგენს სიმაღლეზე მუშაობის (2 მეტრი და მეტი) უსაფრთხოების მოთხოვნებს. მოიცავს: ვარდნის პრევენციის ზომებს; კოლექტიური და ინდივიდუალური დაცვის საშუალებებს; სიმაღლეზე მუშაობის დაგეგმვისა და ორგანიზების წესებს; სპეციალური აღჭურვილობის (კიბეები, ხარაჩოები, ბაქნები) გამოყენების მოთხოვნებს; სამაგრი აღკაზმულობის ტიპებსა და გამოყენების წესებს. სიმაღლეზე მუშაობის ნებართვის გაცემა მოითხოვს რისკის შეფასებას. მუშაკებმა უნდა გაიარონ სპეციალური ტრენინგი (მუხლი 16, ძალაშია 2018 წლის 1 მაისიდან).", category: "worker_safety", source_url: "https://matsne.gov.ge/ka/document/view/3836869", effective_date: "2017-10-30", tags: ["სიმაღლეზე მუშაობა", "ვარდნა", "აღკაზმულობა", "ტრენინგი", "ტექნიკური რეგლამენტი"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-20", title: "დადგენილება №361 — მშენებლობის უსაფრთხოების ტექნიკური რეგლამენტი", content: "ტექნიკური რეგლამენტი მშენებლობის უსაფრთხოების შესახებ. მოიცავს: სამუშაო მოედნის ორგანიზებას და შემოღობვას; სამშენებლო მანქანა-მექანიზმების ექსპლუატაციის წესებს; ელექტრო სამუშაოების უსაფრთხოებას; შედუღებისა და ცხელი სამუშაოების წესებს; მასალების გადატანა-დაწყობის მოთხოვნებს; მიწის სამუშაოებს, ბეტონის სამუშაოებს, მონტაჟს და დემონტაჟს. ვრცელდება ყველა ტიპის სამშენებლო, სარემონტო და სადემონტაჟო სამუშაოებზე.", category: "site_safety", source_url: "https://matsne.gov.ge/ka/document/view/2357152", effective_date: "2014-05-28", tags: ["მშენებლობა", "სამუშაო მოედანი", "ელექტრო", "მონტაჟი", "ტექნიკური რეგლამენტი"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-21", title: "დადგენილება №341 — სამუშაო სივრცეში უსაფრთხოებისა და ჯანმრთელობის მინიმალური მოთხოვნები", content: "ტექნიკური რეგლამენტი ადგენს მინიმალურ მოთხოვნებს დასრულებულ შენობებში არსებულ სამუშაო სივრცეებისთვის. მოიცავს: კონსტრუქციული მდგრადობის მოთხოვნებს; ელექტრო სისტემების უსაფრთხოებას; სახანძრო უსაფრთხოებას და საევაკუაციო გზებს; ვენტილაციისა და ტემპერატურის კონტროლს; განათების ნორმებს; იატაკის, კედლების და ჭერის მდგომარეობას; სანიტარიული კვანძების მოთხოვნებს; ერგონომიკულ სტანდარტებს.", category: "site_safety", source_url: "https://matsne.gov.ge/ka/document/view/5512758", effective_date: "2022-07-04", tags: ["სამუშაო სივრცე", "ჯანმრთელობა", "მინიმალური მოთხოვნები", "ვენტილაცია", "განათება"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-22", title: "დადგენილება №429 — ამწე მოწყობილობების უსაფრთხო ექსპლუატაციის ტექნიკური რეგლამენტი", content: "ტექნიკური რეგლამენტი ამწე მოწყობილობების მოწყობისა და უსაფრთხო ექსპლუატაციის შესახებ. მოიცავს: ამწე მოწყობილობების დაპროექტებას, წარმოებას და რეკონსტრუქციას; მონტაჟისა და ექსპლუატაციის წესებს; პერიოდული ტექნიკური შემოწმების მოთხოვნებს; ოპერატორების კვალიფიკაციის სტანდარტებს; უბედური შემთხვევების პრევენციის ზომებს. ვრცელდება კრანებზე, ლიფტებზე, ამწეებზე და სხვა ამწე მექანიზმებზე.", category: "equipment_safety", source_url: "https://matsne.gov.ge/ka/document/view/2186131", effective_date: "2014-01-01", tags: ["ამწე", "კრანი", "ლიფტი", "ექსპლუატაცია", "ტექნიკური რეგლამენტი"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-23", title: "დადგენილება №69 — საწარმოო სათავსების მიკროკლიმატის ჰიგიენური მოთხოვნები", content: "ტექნიკური რეგლამენტი ადგენს საწარმოო/სამრეწველო სათავსებში მიკროკლიმატის ჰიგიენურ ნორმებს. მოიცავს: ტემპერატურის ოპტიმალურ და დასაშვებ მაჩვენებლებს სამუშაოს სიმძიმის კატეგორიების მიხედვით; ჰაერის ტენიანობის ნორმებს; ჰაერის მოძრაობის სიჩქარის სტანდარტებს; თერმული გამოსხივების ზღვრულ მაჩვენებლებს. განსხვავდება ცივი და თბილი პერიოდის მოთხოვნები.", category: "worker_safety", source_url: "https://matsne.gov.ge/ka/document/view/2198183", effective_date: "2014-01-01", tags: ["მიკროკლიმატი", "ტემპერატურა", "ტენიანობა", "ჰიგიენა", "ტექნიკური რეგლამენტი"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-24", title: "დადგენილება №80 — რისკის შეფასების მეთოდები და პრიორიტეტული დარგები", content: "დადგენილება განსაზღვრავს ეკონომიკური საქმიანობის პრიორიტეტული დარგების კლასიფიკაციას რისკის დონის მიხედვით შრომის უსაფრთხოების მიზნებისთვის. ადგენს რისკის შეფასების განმეორებადობას: მაღალი რისკის მშენებლობა — 10 დღეში ერთხელ; საშუალო რისკი — 1-3 თვეში; დაბალი რისკი (საოფისე) — 6 თვეში. მოიცავს რისკის შეფასების მეთოდოლოგიას და ანგარიშგების ფორმატს.", category: "worker_safety", source_url: "https://matsne.gov.ge/ka/document/view/4486188", effective_date: "2019-09-01", tags: ["რისკის შეფასება", "პრიორიტეტული დარგები", "კლასიფიკაცია", "ტექნიკური რეგლამენტი"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-25", title: "დადგენილება №470 — სამუშაო აღჭურვილობის უსაფრთხოების ტექნიკური რეგლამენტი", content: "ტექნიკური რეგლამენტი სამუშაო სივრცეში სამუშაო აღჭურვილობის/მოწყობილობების გამოყენებისას უსაფრთხოებისა და ჯანმრთელობის დაცვასთან დაკავშირებული მინიმალური მოთხოვნების შესახებ. მოიცავს: აღჭურვილობის შერჩევისა და ექსპლუატაციის წესებს; პერიოდული შემოწმებისა და ტექნიკური მომსახურების მოთხოვნებს; ერგონომიკულ სტანდარტებს; მუშაკების ტრენინგის ვალდებულებებს.", category: "equipment_safety", source_url: "https://matsne.gov.ge/ka/document/view/6488414", effective_date: "2022-01-01", tags: ["სამუშაო აღჭურვილობა", "მოწყობილობები", "ექსპლუატაცია", "ტექნიკური რეგლამენტი"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-26", title: "დადგენილება №540 — უსაფრთხოების ნიშნების განთავსების მინიმალური მოთხოვნები", content: "ტექნიკური რეგლამენტი სამუშაო სივრცეში უსაფრთხოების და/ან ჯანმრთელობის დაცვასთან დაკავშირებული ნიშნების განთავსების მინიმალური მოთხოვნების შესახებ. მოიცავს: საგანგებო გასასვლელების მონიშვნას; ცეცხლსაშიშროების ზონების აღნიშვნას; ქიმიური საფრთხეების გამაფრთხილებელ ნიშნებს; სავალდებულო PPE ზონების მონიშვნას; ნიშნების ზომების, ფერების და განთავსების სტანდარტებს.", category: "site_safety", source_url: "https://matsne.gov.ge/ka/document/view/5572284", effective_date: "2023-01-01", tags: ["უსაფრთხოების ნიშნები", "მონიშვნა", "გამაფრთხილებელი", "ტექნიკური რეგლამენტი"], created_at: "2024-01-01T00:00:00Z" },
  { id: "reg-27", title: "დადგენილება №121 — ინდივიდუალური დაცვის საშუალებების მინიმალური მოთხოვნები", content: "ტექნიკური რეგლამენტი სამუშაო სივრცეში ინდივიდუალური დაცვის საშუალებების (PPE) გამოყენებისას უსაფრთხოებისა და ჯანმრთელობის დაცვასთან დაკავშირებული მინიმალური მოთხოვნების შესახებ. მოიცავს: PPE-ის შერჩევის კრიტერიუმებს რისკის ტიპის მიხედვით; გამოყენების და მოვლის წესებს; დამსაქმებლის ვალდებულებებს PPE-ის უზრუნველყოფაში; მუშაკების ტრენინგის მოთხოვნებს; PPE-ის შემოწმებისა და შეცვლის პერიოდულობას.", category: "worker_safety", source_url: "https://matsne.gov.ge/ka/document/view/5662858", effective_date: "2023-01-01", tags: ["PPE", "ინდივიდუალური დაცვა", "აღჭურვილობა", "ტექნიკური რეგლამენტი"], created_at: "2024-01-01T00:00:00Z" },

  // === ორგანული კანონი (Organic Law) ===
  { id: "reg-28", title: "საქართველოს ორგანული კანონი — შრომის უსაფრთხოების შესახებ", content: "საქართველოს ორგანული კანონი შრომის უსაფრთხოების შესახებ (კანონი №4283-IIს). ადგენს შრომის უსაფრთხოების ძირითად პრინციპებსა და მოთხოვნებს ეკონომიკური საქმიანობის ყველა სექტორისთვის. მოიცავს: დამსაქმებლის ვალდებულებებს (მუხლი 5); რისკის შეფასებას (მუხლი 6); უსაფრთხოების სპეციალისტის დასაქმებას (მუხლი 7); პირველადი დახმარების ზომებს (მუხლი 8); დასაქმებულის უფლებებს (მუხლი 10); სამუშაოზე უარის თქმის უფლებას საფრთხის შემთხვევაში; უსაფრთხოების ხარჯების დამსაქმებელზე დაკისრებას; უბედური შემთხვევების და პროფესიული დაავადებების აღრიცხვას.", category: "worker_safety", source_url: "https://matsne.gov.ge/ka/document/view/4486188", effective_date: "2019-09-01", tags: ["ორგანული კანონი", "შრომის უსაფრთხოება", "დამსაქმებელი", "დასაქმებული", "უფლებები"], created_at: "2024-01-01T00:00:00Z" },
];

// A sample completed inspection for demo
const demoInspections: InspectionWithItems[] = [
  {
    id: "insp-1",
    project_id: "proj-1",
    template_id: "tmpl-1",
    inspector_id: "inspector-1",
    status: "completed",
    safety_score: 72,
    notes: "ზოგიერთი მოაჯირი საჭიროებს შეკეთებას. საერთო მდგომარეობა დამაკმაყოფილებელია.",
    weather: "მზიანი",
    started_at: "2024-03-15T09:00:00Z",
    completed_at: "2024-03-15T11:30:00Z",
    items: [
      { id: "ii-1", inspection_id: "insp-1", template_item_id: "ti-1-1", status: "safe", comment: null, is_critical: true, template_item: demoTemplates[0].items[0], photos: [] },
      { id: "ii-2", inspection_id: "insp-1", template_item_id: "ti-1-2", status: "safe", comment: null, is_critical: true, template_item: demoTemplates[0].items[1], photos: [] },
      { id: "ii-3", inspection_id: "insp-1", template_item_id: "ti-1-3", status: "safe", comment: null, is_critical: true, template_item: demoTemplates[0].items[2], photos: [] },
      { id: "ii-4", inspection_id: "insp-1", template_item_id: "ti-1-4", status: "warning", comment: "მანძილი ცოტა ნაკლებია ნორმაზე", is_critical: false, template_item: demoTemplates[0].items[3], photos: [] },
      { id: "ii-5", inspection_id: "insp-1", template_item_id: "ti-1-5", status: "violation", comment: "2 მოაჯირი აკლია მე-3 სართულზე", is_critical: true, template_item: demoTemplates[0].items[4], photos: [] },
      { id: "ii-6", inspection_id: "insp-1", template_item_id: "ti-1-6", status: "safe", comment: null, is_critical: false, template_item: demoTemplates[0].items[5], photos: [] },
      { id: "ii-7", inspection_id: "insp-1", template_item_id: "ti-1-7", status: "safe", comment: null, is_critical: true, template_item: demoTemplates[0].items[6], photos: [] },
      { id: "ii-8", inspection_id: "insp-1", template_item_id: "ti-1-8", status: "warning", comment: "მცირე კოროზია ქვედა ნაწილში", is_critical: true, template_item: demoTemplates[0].items[7], photos: [] },
      { id: "ii-9", inspection_id: "insp-1", template_item_id: "ti-1-9", status: "safe", comment: null, is_critical: true, template_item: demoTemplates[0].items[8], photos: [] },
    ],
  },
];

function getDefaultData(): AppData {
  return {
    lang: "ka",
    currentRole: "admin",
    currentUser: demoAdmin,
    projects: demoProjects,
    templates: demoTemplates,
    inspections: demoInspections,
    regulations: demoRegulations,
    notifications: [
      { id: "notif-1", user_id: "admin-1", title: "დარღვევა: საცხოვრებელი კომპლექსი ვაკეში", body: "1 დარღვევა აღმოჩენილია ინსპექციის დროს. ქულა: 72%", type: "violation", is_read: false, related_inspection_id: "insp-1", created_at: "2024-03-15T11:30:00Z" },
    ],
    users: [demoAdmin, demoInspector, demoClient],
  };
}

export function loadData(): AppData {
  if (typeof window === "undefined") return getDefaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data: AppData = JSON.parse(raw);
      // Merge any new default regulations not yet in localStorage
      const defaults = getDefaultData();
      const existingIds = new Set(data.regulations.map((r) => r.id));
      const missing = defaults.regulations.filter((r) => !existingIds.has(r.id));
      if (missing.length > 0) {
        data.regulations = [...data.regulations, ...missing];
        saveData(data);
      }
      return data;
    }
  } catch {}
  const data = getDefaultData();
  saveData(data);
  return data;
}

export function saveData(data: AppData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData(): AppData {
  const data = getDefaultData();
  saveData(data);
  return data;
}

export function switchRole(role: UserRole): AppData {
  const data = loadData();
  data.currentRole = role;
  data.currentUser = role === "admin" ? demoAdmin : role === "inspector" ? demoInspector : demoClient;
  saveData(data);
  return data;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
