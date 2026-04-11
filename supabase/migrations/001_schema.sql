-- =============================================
-- სამშენებლო უსაფრთხოების აპლიკაციის ბაზის სქემა
-- Construction Safety App Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. კომპანიები (Companies)
-- =============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  contact_email TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. მომხმარებლები (Users / Profiles)
-- =============================================
CREATE TYPE user_role AS ENUM ('admin', 'inspector', 'client');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'inspector',
  company_id UUID REFERENCES companies(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. პროექტები / სამშენებლო ობიექტები (Projects)
-- =============================================
CREATE TYPE project_status AS ENUM ('active', 'completed', 'paused');

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  address TEXT,
  status project_status DEFAULT 'active',
  client_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. შემოწმების შაბლონები (Checklist Templates)
-- =============================================
CREATE TYPE checklist_category AS ENUM (
  'scaffold_fixed',
  'scaffold_mobile',
  'scaffold_suspended',
  'harness_ppe',
  'equipment',
  'ppe_general'
);

CREATE TABLE checklist_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category checklist_category NOT NULL,
  company_id UUID REFERENCES companies(id), -- NULL = system default
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE checklist_template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  is_critical BOOLEAN DEFAULT false
);

-- =============================================
-- 5. ინსპექციები (Inspections)
-- =============================================
CREATE TYPE inspection_status AS ENUM ('in_progress', 'completed');

CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id),
  template_id UUID NOT NULL REFERENCES checklist_templates(id),
  inspector_id UUID NOT NULL REFERENCES profiles(id),
  status inspection_status DEFAULT 'in_progress',
  safety_score FLOAT,
  notes TEXT,
  weather TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- =============================================
-- 6. ინსპექციის პუნქტები (Inspection Items)
-- =============================================
CREATE TYPE checklist_item_status AS ENUM ('safe', 'warning', 'violation', 'not_applicable');

CREATE TABLE inspection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  template_item_id UUID NOT NULL REFERENCES checklist_template_items(id),
  status checklist_item_status DEFAULT 'not_applicable',
  comment TEXT,
  is_critical BOOLEAN DEFAULT false
);

-- =============================================
-- 7. ინსპექციის ფოტოები (Inspection Photos)
-- =============================================
CREATE TABLE inspection_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_item_id UUID NOT NULL REFERENCES inspection_items(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  taken_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 8. რეგულაციები (Regulations)
-- =============================================
CREATE TYPE regulation_category AS ENUM ('worker_safety', 'equipment_safety', 'site_safety');

CREATE TABLE regulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category regulation_category NOT NULL,
  source_url TEXT,
  effective_date DATE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. შეტყობინებები (Notifications)
-- =============================================
CREATE TYPE notification_type AS ENUM ('violation', 'report_ready', 'inspection_due');

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type notification_type NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_inspection_id UUID REFERENCES inspections(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ინდექსები (Indexes)
-- =============================================
CREATE INDEX idx_profiles_company ON profiles(company_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_inspections_project ON inspections(project_id);
CREATE INDEX idx_inspections_inspector ON inspections(inspector_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspection_items_inspection ON inspection_items(inspection_id);
CREATE INDEX idx_inspection_photos_item ON inspection_photos(inspection_item_id);
CREATE INDEX idx_regulations_category ON regulations(category);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- =============================================
-- Storage bucket for photos
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('inspection-photos', 'inspection-photos', true)
ON CONFLICT DO NOTHING;
