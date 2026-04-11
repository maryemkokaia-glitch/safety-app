-- =============================================
-- FULL SETUP: Run this ONCE in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  contact_email TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles
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

-- 3. Projects
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

-- 4. Checklist Templates
CREATE TYPE checklist_category AS ENUM ('scaffold_fixed','scaffold_mobile','scaffold_suspended','harness_ppe','equipment','ppe_general');

CREATE TABLE checklist_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category checklist_category NOT NULL,
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE checklist_template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  is_critical BOOLEAN DEFAULT false
);

-- 5. Inspections
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

-- 6. Inspection Items
CREATE TYPE checklist_item_status AS ENUM ('safe', 'warning', 'violation', 'not_applicable');

CREATE TABLE inspection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  template_item_id UUID NOT NULL REFERENCES checklist_template_items(id),
  status checklist_item_status DEFAULT 'not_applicable',
  comment TEXT,
  is_critical BOOLEAN DEFAULT false
);

-- 7. Inspection Photos
CREATE TABLE inspection_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_item_id UUID NOT NULL REFERENCES inspection_items(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  taken_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Regulations
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

-- 9. Notifications
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

-- Indexes
CREATE INDEX idx_profiles_company ON profiles(company_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_inspections_project ON inspections(project_id);
CREATE INDEX idx_inspections_inspector ON inspections(inspector_id);
CREATE INDEX idx_inspection_items_inspection ON inspection_items(inspection_id);
CREATE INDEX idx_inspection_photos_item ON inspection_photos(inspection_item_id);
CREATE INDEX idx_regulations_category ON regulations(category);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('inspection-photos', 'inspection-photos', true) ON CONFLICT DO NOTHING;

-- =============================================
-- RLS (Row Level Security)
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_user_role() RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_company() RETURNS UUID AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (company_id = get_user_company() OR id = auth.uid());
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (get_user_role() = 'admin' OR id = auth.uid());

-- Companies
CREATE POLICY "companies_select" ON companies FOR SELECT USING (true);
CREATE POLICY "companies_all" ON companies FOR ALL USING (true);

-- Projects
CREATE POLICY "projects_select" ON projects FOR SELECT USING (company_id = get_user_company() OR client_id = auth.uid());
CREATE POLICY "projects_insert" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "projects_update" ON projects FOR UPDATE USING (true);
CREATE POLICY "projects_delete" ON projects FOR DELETE USING (get_user_role() = 'admin');

-- Templates (public read)
CREATE POLICY "templates_select" ON checklist_templates FOR SELECT USING (true);
CREATE POLICY "templates_all" ON checklist_templates FOR ALL USING (true);
CREATE POLICY "template_items_select" ON checklist_template_items FOR SELECT USING (true);
CREATE POLICY "template_items_all" ON checklist_template_items FOR ALL USING (true);

-- Inspections
CREATE POLICY "inspections_select" ON inspections FOR SELECT USING (true);
CREATE POLICY "inspections_insert" ON inspections FOR INSERT WITH CHECK (true);
CREATE POLICY "inspections_update" ON inspections FOR UPDATE USING (true);

-- Inspection Items
CREATE POLICY "items_select" ON inspection_items FOR SELECT USING (true);
CREATE POLICY "items_all" ON inspection_items FOR ALL USING (true);

-- Photos
CREATE POLICY "photos_select" ON inspection_photos FOR SELECT USING (true);
CREATE POLICY "photos_all" ON inspection_photos FOR ALL USING (true);

-- Regulations (public read)
CREATE POLICY "regulations_select" ON regulations FOR SELECT USING (true);
CREATE POLICY "regulations_all" ON regulations FOR ALL USING (true);

-- Notifications
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);

-- Storage policies
CREATE POLICY "storage_select" ON storage.objects FOR SELECT USING (bucket_id = 'inspection-photos');
CREATE POLICY "storage_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'inspection-photos');
CREATE POLICY "storage_delete" ON storage.objects FOR DELETE USING (bucket_id = 'inspection-photos');

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'inspector')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- SEED DATA: Checklist Templates
-- =============================================

INSERT INTO checklist_templates (id, name, category) VALUES
  ('11111111-1111-1111-1111-111111111111', 'ფასადის ხარაჩოების ყოველკვირეული შემოწმება', 'scaffold_fixed'),
  ('22222222-2222-2222-2222-222222222222', 'მოძრავი ხარაჩოების შემოწმება', 'scaffold_mobile'),
  ('33333333-3333-3333-3333-333333333333', 'ჩამოკიდებული ხარაჩოების შემოწმება', 'scaffold_suspended'),
  ('44444444-4444-4444-4444-444444444444', 'უსაფრთხოების აღკაზმულობის შემოწმება', 'harness_ppe'),
  ('55555555-5555-5555-5555-555555555555', 'ტექნიკური აღჭურვილობის შემოწმება', 'equipment'),
  ('66666666-6666-6666-6666-666666666666', 'პირადი დამცავი აღჭურვილობის შემოწმება', 'ppe_general');

INSERT INTO checklist_template_items (template_id, text, order_index, is_critical) VALUES
  ('11111111-1111-1111-1111-111111111111', 'საანკერე სამაგრები სწორად არის დამონტაჟებული', 1, true),
  ('11111111-1111-1111-1111-111111111111', 'პლატფორმის სიგანე >= 80 სმ', 2, true),
  ('11111111-1111-1111-1111-111111111111', 'პლატფორმის სტაბილურობა (მყარი და დაცული)', 3, true),
  ('11111111-1111-1111-1111-111111111111', 'ხარაჩოსა და შენობას შორის უსაფრთხო მანძილი', 4, false),
  ('11111111-1111-1111-1111-111111111111', 'მოაჯირები დამონტაჟებულია (სწორი რაოდენობა)', 5, true),
  ('11111111-1111-1111-1111-111111111111', 'ვერტიკალურ საყრდენებს შორის სწორი მანძილი', 6, false),
  ('11111111-1111-1111-1111-111111111111', 'ხარაჩო მყარ ზედაპირზეა განთავსებული', 7, true),
  ('11111111-1111-1111-1111-111111111111', 'არ არის ხილული დაზიანება ან დეფორმაცია', 8, true),
  ('11111111-1111-1111-1111-111111111111', 'უსაფრთხო წვდომა (კიბეები/საფეხურები დამონტაჟებულია)', 9, true),
  ('22222222-2222-2222-2222-222222222222', 'ბორბლები ფუნქციონირებს და იბლოკება', 1, true),
  ('22222222-2222-2222-2222-222222222222', 'მუხრუჭები მუშაობს', 2, true),
  ('22222222-2222-2222-2222-222222222222', 'კონსტრუქცია სტაბილურია', 3, true),
  ('22222222-2222-2222-2222-222222222222', 'მოაჯირები დამონტაჟებულია', 4, true),
  ('22222222-2222-2222-2222-222222222222', 'გადაადგილება მხოლოდ ცარიელ მდგომარეობაში', 5, false),
  ('22222222-2222-2222-2222-222222222222', 'ზედაპირი უსაფრთხოა', 6, false),
  ('22222222-2222-2222-2222-222222222222', 'არ არის სტრუქტურული დაზიანება', 7, true),
  ('33333333-3333-3333-3333-333333333333', 'შეწყვეტის სისტემა დაცულია', 1, true),
  ('33333333-3333-3333-3333-333333333333', 'ბაგირები/თოკები დაუზიანებელია', 2, true),
  ('33333333-3333-3333-3333-333333333333', 'დატვირთვის მოცულობა დაცულია', 3, true),
  ('33333333-3333-3333-3333-333333333333', 'უსაფრთხოების საკეტები მუშაობს', 4, true),
  ('33333333-3333-3333-3333-333333333333', 'პლატფორმის სტაბილურობა', 5, true),
  ('33333333-3333-3333-3333-333333333333', 'საგანგებო სისტემები ხელმისაწვდომია', 6, true),
  ('33333333-3333-3333-3333-333333333333', 'მუშები იყენებენ აღკაზმულობას', 7, true),
  ('44444444-4444-4444-4444-444444444444', 'არ არის ხილული დაზიანება', 1, true),
  ('44444444-4444-4444-4444-444444444444', 'კაუჭები/კონექტორები ფუნქციონირებს', 2, true),
  ('44444444-4444-4444-4444-444444444444', 'მოქმედი შემოწმების ნიშანი', 3, true),
  ('44444444-4444-4444-4444-444444444444', 'სწორი მორგება', 4, false),
  ('44444444-4444-4444-4444-444444444444', 'სწორი გამოყენება', 5, false),
  ('55555555-5555-5555-5555-555555555555', 'აღჭურვილობის მდგომარეობა კარგია', 1, false),
  ('55555555-5555-5555-5555-555555555555', 'არ არის დაზიანება ან გაშიშვლებული მავთულები', 2, true),
  ('55555555-5555-5555-5555-555555555555', 'უსაფრთხოების ფარები დამონტაჟებულია', 3, true),
  ('55555555-5555-5555-5555-555555555555', 'სწორი გამოყენება', 4, false),
  ('55555555-5555-5555-5555-555555555555', 'ტექნიკური მომსახურება შესრულებულია', 5, false),
  ('66666666-6666-6666-6666-666666666666', 'PPE ატარია ყველა მუშას', 1, true),
  ('66666666-6666-6666-6666-666666666666', 'კარგ მდგომარეობაშია', 2, false),
  ('66666666-6666-6666-6666-666666666666', 'არ არის დაზიანებული', 3, true),
  ('66666666-6666-6666-6666-666666666666', 'შესაფერისია დავალებისთვის', 4, false),
  ('66666666-6666-6666-6666-666666666666', 'სუფთა და გამოსაყენებელი', 5, false);

-- =============================================
-- SEED DATA: Georgian Safety Regulations
-- =============================================
INSERT INTO regulations (title, content, category, source_url, tags) VALUES
('სამუშაო ადგილზე უსაფრთხოების ზოგადი მოთხოვნები', 'ყველა სამშენებლო ობიექტზე დამსაქმებელი ვალდებულია უზრუნველყოს მუშათა უსაფრთხოება შრომის კოდექსის შესაბამისად. ეს მოიცავს: სამუშაო ადგილის რისკების შეფასებას, მუშათა ინსტრუქტაჟს, პირადი დამცავი აღჭურვილობის მიწოდებას და უსაფრთხოების ზომების მუდმივ მონიტორინგს.', 'worker_safety', 'https://matsne.gov.ge', ARRAY['უსაფრთხოება', 'მუშა', 'ზოგადი']),
('სიმაღლეზე მუშაობის წესები', 'სიმაღლეზე (1.8 მეტრზე მეტი) მუშაობისას სავალდებულოა: უსაფრთხოების აღკაზმულობის გამოყენება, მოაჯირების დამონტაჟება, დაცემისგან დამცავი ბადეების განთავსება.', 'worker_safety', 'https://matsne.gov.ge', ARRAY['სიმაღლე', 'აღკაზმულობა', 'დაცემა']),
('ხარაჩოების უსაფრთხოების მოთხოვნები', 'ხარაჩოები უნდა აკმაყოფილებდეს შემდეგ მოთხოვნებს: დამონტაჟებული უნდა იყოს სერტიფიცირებული სპეციალისტის მიერ, ყოველკვირეულ შემოწმებას ექვემდებარება, პლატფორმის სიგანე მინიმუმ 80 სმ.', 'equipment_safety', 'https://matsne.gov.ge', ARRAY['ხარაჩო', 'მონტაჟი', 'შემოწმება']),
('ელექტრო ხელსაწყოების უსაფრთხოება', 'ელექტრო ხელსაწყოების გამოყენებისას: ხელსაწყოები უნდა იყოს გამართულ მდგომარეობაში, კაბელები დაუზიანებელი, დამიწება სწორი.', 'equipment_safety', 'https://matsne.gov.ge', ARRAY['ელექტრო', 'ხელსაწყო', 'კაბელი']),
('სამშენებლო ობიექტის შემოღობვა', 'სამშენებლო ობიექტი უნდა იყოს შემოღობილი მინიმუმ 2 მეტრის სიმაღლის ღობით. შესასვლელი უნდა იყოს კონტროლირებადი.', 'site_safety', 'https://matsne.gov.ge', ARRAY['ღობე', 'შესასვლელი', 'განათება']),
('სახანძრო უსაფრთხოება სამშენებლო ობიექტზე', 'სამშენებლო ობიექტზე უნდა არსებობდეს: ცეცხლმაქრები (1 ყოველ 200 კვ.მ-ზე), საევაკუაციო გზები მკაფიოდ მონიშნული.', 'site_safety', 'https://matsne.gov.ge', ARRAY['ხანძარი', 'ცეცხლმაქრი', 'ევაკუაცია']),
('პირადი დამცავი აღჭურვილობის (PPE) მოთხოვნები', 'სამშენებლო ობიექტზე სავალდებულოა: უსაფრთხოების ჩაფხუტი, ამრეკლავი ჟილეტი, უსაფრთხოების ფეხსაცმელი, სამუშაო ხელთათმანები.', 'worker_safety', 'https://matsne.gov.ge', ARRAY['PPE', 'ჩაფხუტი', 'ჟილეტი']),
('პირველადი დახმარების მოთხოვნები', 'ყველა სამშენებლო ობიექტზე უნდა არსებობდეს პირველადი დახმარების ნაკრები და გადაუდებელი დახმარების გეგმა.', 'worker_safety', 'https://matsne.gov.ge', ARRAY['პირველადი დახმარება', 'სამედიცინო']),
('ამწე მოწყობილობების ექსპლუატაცია', 'ამწე მოწყობილობების ექსპლუატაცია დასაშვებია მხოლოდ სერტიფიცირებული ოპერატორის მიერ, ტექნიკური შემოწმების გავლის შემდეგ.', 'equipment_safety', 'https://matsne.gov.ge', ARRAY['ამწე', 'კრანი', 'ოპერატორი']),
('ნარჩენების მართვა სამშენებლო ობიექტზე', 'სამშენებლო ნარჩენები უნდა იყოს სორტირებული ტიპის მიხედვით, რეგულარულად გატანილი. აკრძალულია ნარჩენების დაწვა ობიექტზე.', 'site_safety', 'https://matsne.gov.ge', ARRAY['ნარჩენი', 'სორტირება', 'გატანა']);
