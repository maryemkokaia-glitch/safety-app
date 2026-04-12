export type UserRole = "admin" | "inspector" | "client";

export type ProjectStatus = "active" | "completed" | "paused";

export type InspectionStatus = "in_progress" | "completed";

export type ChecklistItemStatus = "safe" | "warning" | "violation" | "not_applicable";

export type ChecklistCategory =
  | "scaffold_fixed"
  | "scaffold_mobile"
  | "scaffold_suspended"
  | "harness_ppe"
  | "equipment"
  | "ppe_general"
  | "physical_factors";

export type ChecklistInputType = "check" | "measurement";

export type RegulationCategory = "worker_safety" | "equipment_safety" | "site_safety";

export type NotificationType = "violation" | "report_ready" | "inspection_due";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  company_id: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  address: string | null;
  contact_email: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  company_id: string;
  name: string;
  address: string | null;
  status: ProjectStatus;
  client_id: string | null;
  inspector_id: string | null;
  client_emails?: string[];
  created_at: string;
  // Joined fields
  client?: User;
  company?: Company;
  inspections?: Inspection[];
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  category: ChecklistCategory;
  company_id: string | null;
  created_at: string;
  items?: ChecklistTemplateItem[];
}

export interface ChecklistTemplateItem {
  id: string;
  template_id: string;
  text: string;
  order_index: number;
  is_critical: boolean;
  input_type?: ChecklistInputType;
  unit?: string;
  norm_min?: number | null;
  norm_max?: number | null;
}

export interface Inspection {
  id: string;
  project_id: string;
  template_id: string;
  inspector_id: string;
  status: InspectionStatus;
  safety_score: number | null;
  notes: string | null;
  weather: string | null;
  started_at: string;
  completed_at: string | null;
  // Joined fields
  project?: Project;
  template?: ChecklistTemplate;
  inspector?: User;
  items?: InspectionItem[];
}

export interface InspectionItem {
  id: string;
  inspection_id: string;
  template_item_id: string;
  status: ChecklistItemStatus;
  comment: string | null;
  is_critical: boolean;
  measured_value?: number | null;
  // Joined
  template_item?: ChecklistTemplateItem;
  photos?: InspectionPhoto[];
}

export interface InspectionPhoto {
  id: string;
  inspection_item_id: string;
  photo_url: string;
  caption: string | null;
  taken_at: string;
}

export interface Regulation {
  id: string;
  title: string;
  content: string;
  category: RegulationCategory;
  source_url: string | null;
  effective_date: string | null;
  tags: string[];
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  is_read: boolean;
  related_inspection_id: string | null;
  created_at: string;
}

// Compound types for demo data store
export type TemplateWithItems = ChecklistTemplate & { items: ChecklistTemplateItem[] };

export type InspectionWithItems = Inspection & {
  items: (InspectionItem & { template_item?: ChecklistTemplateItem; photos?: InspectionPhoto[] })[];
};
