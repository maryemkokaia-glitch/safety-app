export type Lang = "ka" | "en";

export const translations = {
  // Common
  "app.name": { ka: "SafetyApp", en: "SafetyApp" },
  "app.tagline": { ka: "სამშენებლო უსაფრთხოების მართვის სისტემა", en: "Construction Safety Management System" },
  "demo": { ka: "DEMO", en: "DEMO" },
  "back": { ka: "უკან", en: "Back" },
  "cancel": { ka: "გაუქმება", en: "Cancel" },
  "create": { ka: "შექმნა", en: "Create" },
  "add": { ka: "დამატება", en: "Add" },
  "loading": { ka: "იტვირთება...", en: "Loading..." },
  "search": { ka: "მოძებნეთ...", en: "Search..." },
  "no_data": { ka: "მონაცემები არ არის", en: "No data" },
  "all": { ka: "ყველა", en: "All" },
  "reset_data": { ka: "მონაცემების გადატვირთვა", en: "Reset Data" },
  "settings": { ka: "პარამეტრები", en: "Settings" },
  "language": { ka: "ენა", en: "Language" },

  // Roles
  "role.admin": { ka: "ადმინისტრატორი", en: "Administrator" },
  "role.inspector": { ka: "ინსპექტორი", en: "Inspector" },
  "role.client": { ka: "კლიენტი", en: "Client" },
  "role.admin_short": { ka: "ადმინი", en: "Admin" },
  "switch_role": { ka: "როლი შეცვალე", en: "Switch Role" },

  // Navigation
  "nav.dashboard": { ka: "მთავარი", en: "Dashboard" },
  "nav.projects": { ka: "პროექტები", en: "Projects" },
  "nav.users": { ka: "მომხმარებლები", en: "Users" },
  "nav.templates": { ka: "შაბლონები", en: "Templates" },
  "nav.regulations": { ka: "რეგულაციები", en: "Regulations" },
  "nav.history": { ka: "ისტორია", en: "History" },

  // Dashboard
  "dashboard.title": { ka: "მთავარი პანელი", en: "Dashboard" },
  "dashboard.projects": { ka: "პროექტი", en: "Projects" },
  "dashboard.users": { ka: "მომხმარებელი", en: "Users" },
  "dashboard.inspections": { ka: "ინსპექცია", en: "Inspections" },
  "dashboard.violations": { ka: "დარღვევა", en: "Violations" },
  "dashboard.recent": { ka: "ბოლო ინსპექციები", en: "Recent Inspections" },
  "dashboard.no_inspections": { ka: "ჯერ არ არის ინსპექციები", en: "No inspections yet" },

  // Status
  "status.completed": { ka: "დასრულებული", en: "Completed" },
  "status.in_progress": { ka: "მიმდინარე", en: "In Progress" },
  "status.active": { ka: "აქტიური", en: "Active" },
  "status.paused": { ka: "შეჩერებული", en: "Paused" },

  // Inspection
  "inspection.safe": { ka: "უსაფრთხო", en: "Safe" },
  "inspection.warning": { ka: "გაფრთხილება", en: "Warning" },
  "inspection.violation": { ka: "დარღვევა", en: "Violation" },
  "inspection.na": { ka: "N/A", en: "N/A" },
  "inspection.critical": { ka: "კრიტიკული", en: "Critical" },
  "inspection.new": { ka: "ახალი ინსპექცია", en: "New Inspection" },
  "inspection.start": { ka: "დაწყება", en: "Start" },
  "inspection.finish": { ka: "დასრულება", en: "Finish" },
  "inspection.comment": { ka: "კომენტარი", en: "Comment" },
  "inspection.notes": { ka: "ზოგადი შენიშვნები", en: "General Notes" },
  "inspection.notes_placeholder": { ka: "დამატებითი შენიშვნები...", en: "Additional notes..." },
  "inspection.progress": { ka: "პროგრესი", en: "Progress" },
  "inspection.score": { ka: "ქულა", en: "Score" },
  "inspection.select_project": { ka: "აირჩიეთ პროექტი", en: "Select project" },
  "inspection.select_template": { ka: "აირჩიეთ შაბლონი", en: "Select template" },
  "inspection.completed_list": { ka: "დასრულებული ინსპექციები", en: "Completed Inspections" },
  "inspection.no_completed": { ka: "ჯერ არ არის დასრულებული ინსპექციები", en: "No completed inspections yet" },
  "inspection.history": { ka: "ინსპექციების ისტორია", en: "Inspection History" },
  "inspection.enter_value": { ka: "შეიყვანეთ მნიშვნელობა", en: "Enter value" },
  "inspection.measured_value": { ka: "გაზომილი მნიშვნელობა", en: "Measured value" },
  "inspection.add_photo": { ka: "ფოტოს დამატება", en: "Add Photo" },
  "inspection.photos": { ka: "ფოტოები", en: "Photos" },
  "inspection.photo_count": { ka: "ფოტო", en: "photo(s)" },
  "inspection.remove_photo": { ka: "წაშლა", en: "Remove" },
  "inspection.pick_template": { ka: "აირჩიეთ შაბლონი", en: "Pick a template" },
  "inspection.photo_caption": { ka: "ფოტოს აღწერა...", en: "Photo caption..." },
  "inspection.weather": { ka: "ამინდი", en: "Weather" },
  "weather.sunny": { ka: "მზიანი", en: "Sunny" },
  "weather.cloudy": { ka: "მოღრუბლული", en: "Cloudy" },
  "weather.rainy": { ka: "წვიმიანი", en: "Rainy" },
  "weather.windy": { ka: "ქარიანი", en: "Windy" },

  // Score
  "score.excellent": { ka: "შესანიშნავი", en: "Excellent" },
  "score.good": { ka: "კარგი", en: "Good" },
  "score.attention": { ka: "საჭიროებს ყურადღებას", en: "Needs Attention" },
  "score.critical": { ka: "კრიტიკული", en: "Critical" },
  "score.average": { ka: "საშუალო ქულა", en: "Average Score" },

  // Projects
  "project.new": { ka: "ახალი პროექტი", en: "New Project" },
  "project.name": { ka: "პროექტის სახელი", en: "Project Name" },
  "project.address": { ka: "მისამართი", en: "Address" },
  "project.no_projects": { ka: "ჯერ არ არის პროექტები", en: "No projects yet" },
  "project.create_first": { ka: "შექმენით პირველი პროექტი", en: "Create first project" },
  "project.created": { ka: "შექმნის თარიღი", en: "Created" },
  "project.no_inspections": { ka: "ჯერ არ არის ინსპექციები", en: "No inspections yet" },

  // Users
  "user.add": { ka: "მომხმარებლის დამატება", en: "Add User" },

  // Templates
  "template.title": { ka: "შემოწმების შაბლონები", en: "Inspection Templates" },
  "template.items": { ka: "პუნქტი", en: "items" },
  "template.checklist_items": { ka: "შემოწმების პუნქტები", en: "Checklist Items" },
  "template.new": { ka: "ახალი შაბლონი", en: "New Template" },
  "template.edit": { ka: "რედაქტირება", en: "Edit" },
  "template.delete": { ka: "შაბლონის წაშლა", en: "Delete Template" },
  "template.duplicate": { ka: "დუბლირება", en: "Duplicate" },
  "template.add_item": { ka: "პუნქტის დამატება", en: "Add Item" },
  "template.item_placeholder": { ka: "შეიყვანეთ შემოწმების პუნქტი...", en: "Enter checklist item..." },
  "template.name_placeholder": { ka: "შაბლონის სახელი", en: "Template name" },
  "template.category": { ka: "კატეგორია", en: "Category" },
  "template.mark_critical": { ka: "კრიტიკული", en: "Critical" },
  "template.delete_confirm": { ka: "ნამდვილად გსურთ ამ შაბლონის წაშლა?", en: "Are you sure you want to delete this template?" },
  "template.saved": { ka: "შენახულია", en: "Saved" },
  "template.type_check": { ka: "შემოწმება", en: "Check" },
  "template.type_measurement": { ka: "გაზომვა", en: "Measurement" },
  "template.unit": { ka: "ერთეული", en: "Unit" },
  "template.norm_min": { ka: "მინიმუმი", en: "Min" },
  "template.norm_max": { ka: "მაქსიმუმი", en: "Max" },
  "template.norm": { ka: "ნორმა", en: "Norm" },

  // Project settings
  "project.inspector": { ka: "ინსპექტორი", en: "Inspector" },
  "project.client": { ka: "კლიენტი", en: "Client" },
  "project.description": { ka: "აღწერა", en: "Description" },
  "project.select_inspector": { ka: "აირჩიეთ ინსპექტორი", en: "Select inspector" },
  "project.select_client": { ka: "აირჩიეთ კლიენტი", en: "Select client" },

  // Confirm
  "confirm.yes": { ka: "დიახ", en: "Yes" },
  "confirm.no": { ka: "არა", en: "No" },
  "confirm.delete": { ka: "ნამდვილად გსურთ წაშლა?", en: "Are you sure?" },

  // Categories
  "cat.scaffold_fixed": { ka: "ფასადის ხარაჩო", en: "Facade Scaffold" },
  "cat.scaffold_mobile": { ka: "მოძრავი ხარაჩო", en: "Mobile Scaffold" },
  "cat.scaffold_suspended": { ka: "ჩამოკიდებული ხარაჩო", en: "Suspended Scaffold" },
  "cat.harness_ppe": { ka: "აღკაზმულობა", en: "Harness" },
  "cat.equipment": { ka: "აღჭურვილობა", en: "Equipment" },
  "cat.ppe_general": { ka: "PPE", en: "PPE" },
  "cat.physical_factors": { ka: "ფიზიკური ფაქტორები", en: "Physical Factors" },

  // Regulations
  "reg.title": { ka: "რეგულაციები", en: "Regulations" },
  "reg.safety_regs": { ka: "უსაფრთხოების რეგულაციები", en: "Safety Regulations" },
  "reg.search": { ka: "მოძებნეთ რეგულაცია...", en: "Search regulations..." },
  "reg.not_found": { ka: "რეგულაცია ვერ მოიძებნა", en: "No regulations found" },
  "reg.worker_safety": { ka: "მუშათა უსაფრთხოება", en: "Worker Safety" },
  "reg.equipment_safety": { ka: "აღჭურვილობის უსაფრთხოება", en: "Equipment Safety" },
  "reg.site_safety": { ka: "ობიექტის უსაფრთხოება", en: "Site Safety" },

  // Client
  "client.title": { ka: "კლიენტის პანელი", en: "Client Dashboard" },
  "client.my_projects": { ka: "ჩემი პროექტები", en: "My Projects" },
  "client.no_projects": { ka: "ჯერ არ გაქვთ მინიჭებული პროექტები", en: "No assigned projects" },
  "client.recent_reports": { ka: "ბოლო ანგარიშები", en: "Recent Reports" },
  "client.no_reports": { ka: "ჯერ არ არის ანგარიშები", en: "No reports yet" },

  // Report
  "report.download_pdf": { ka: "PDF ჩამოტვირთვა", en: "Download PDF" },
  "report.generating": { ka: "იქმნება...", en: "Generating..." },
  "report.notes": { ka: "შენიშვნები", en: "Notes" },
  "report.violations": { ka: "დარღვევები", en: "Violations" },
  "report.all_items": { ka: "ყველა პუნქტი", en: "All Items" },
  "report.pdf_error": { ka: "PDF-ის გენერაცია ვერ მოხერხდა", en: "PDF generation failed" },
  "report.font_warning": { ka: "ქართული შრიფტი ვერ ჩაიტვირთა", en: "Georgian font failed to load" },

  // Landing
  "landing.enter_demo": { ka: "შედით დემო ვერსიაში", en: "Enter Demo" },
  "landing.demo_login": { ka: "დემო შესვლა", en: "Demo Login" },
  "landing.features.inspections": { ka: "ინსპექციები", en: "Inspections" },
  "landing.features.inspections_desc": { ka: "წინასწარ განსაზღვრული ჩეკლისტები ხარაჩოების, აღჭურვილობისა და PPE-ის შესამოწმებლად", en: "Predefined checklists for scaffolding, equipment, and PPE inspection" },
  "landing.features.photos": { ka: "ფოტო დოკუმენტაცია", en: "Photo Documentation" },
  "landing.features.photos_desc": { ka: "გადაიღეთ ფოტოები ადგილზე და მიაბით თითოეულ ჩეკლისტის პუნქტს", en: "Capture photos on-site and link to each checklist item" },
  "landing.features.reports": { ka: "PDF ანგარიშები", en: "PDF Reports" },
  "landing.features.reports_desc": { ka: "ავტომატურად გენერირებული PDF ანგარიშები კლიენტებისთვის", en: "Auto-generated PDF reports for clients" },
  "landing.features.regs": { ka: "რეგულაციები", en: "Regulations" },
  "landing.features.regs_desc": { ka: "საქართველოს უსაფრთხოების რეგულაციები ხელმისაწვდომი და მოსაძიებელი", en: "Georgian safety regulations searchable and accessible" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key]?.[lang] || key;
}
