-- =============================================
-- Row Level Security Policies
-- =============================================

-- Enable RLS on all tables
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

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to get user company
CREATE OR REPLACE FUNCTION get_user_company()
RETURNS UUID AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================
-- Profiles policies
-- =============================================
CREATE POLICY "Users can view profiles in their company"
  ON profiles FOR SELECT
  USING (company_id = get_user_company() OR id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (get_user_role() = 'admin' OR id = auth.uid());

-- =============================================
-- Companies policies
-- =============================================
CREATE POLICY "Users can view their company"
  ON companies FOR SELECT
  USING (id = get_user_company());

CREATE POLICY "Admins can manage companies"
  ON companies FOR ALL
  USING (get_user_role() = 'admin');

-- =============================================
-- Projects policies
-- =============================================
CREATE POLICY "Company users can view projects"
  ON projects FOR SELECT
  USING (
    company_id = get_user_company()
    OR client_id = auth.uid()
  );

CREATE POLICY "Admins can manage projects"
  ON projects FOR INSERT
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  USING (get_user_role() = 'admin' AND company_id = get_user_company());

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (get_user_role() = 'admin' AND company_id = get_user_company());

-- =============================================
-- Checklist templates policies
-- =============================================
CREATE POLICY "Anyone can view templates"
  ON checklist_templates FOR SELECT
  USING (company_id IS NULL OR company_id = get_user_company());

CREATE POLICY "Admins can manage templates"
  ON checklist_templates FOR ALL
  USING (get_user_role() = 'admin');

CREATE POLICY "Anyone can view template items"
  ON checklist_template_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage template items"
  ON checklist_template_items FOR ALL
  USING (get_user_role() = 'admin');

-- =============================================
-- Inspections policies
-- =============================================
CREATE POLICY "Company users can view inspections"
  ON inspections FOR SELECT
  USING (
    inspector_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = inspections.project_id
      AND (projects.company_id = get_user_company() OR projects.client_id = auth.uid())
    )
  );

CREATE POLICY "Inspectors can create inspections"
  ON inspections FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'inspector'));

CREATE POLICY "Inspectors can update their inspections"
  ON inspections FOR UPDATE
  USING (inspector_id = auth.uid() OR get_user_role() = 'admin');

-- =============================================
-- Inspection items policies
-- =============================================
CREATE POLICY "Users can view inspection items"
  ON inspection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = inspection_items.inspection_id
      AND (inspections.inspector_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = inspections.project_id
          AND (projects.company_id = get_user_company() OR projects.client_id = auth.uid())
        ))
    )
  );

CREATE POLICY "Inspectors can manage inspection items"
  ON inspection_items FOR ALL
  USING (get_user_role() IN ('admin', 'inspector'));

-- =============================================
-- Inspection photos policies
-- =============================================
CREATE POLICY "Users can view photos"
  ON inspection_photos FOR SELECT
  USING (true);

CREATE POLICY "Inspectors can manage photos"
  ON inspection_photos FOR ALL
  USING (get_user_role() IN ('admin', 'inspector'));

-- =============================================
-- Regulations policies (public read)
-- =============================================
CREATE POLICY "Anyone can view regulations"
  ON regulations FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage regulations"
  ON regulations FOR ALL
  USING (get_user_role() = 'admin');

-- =============================================
-- Notifications policies
-- =============================================
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- =============================================
-- Storage policies for photos
-- =============================================
CREATE POLICY "Anyone can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'inspection-photos');

CREATE POLICY "Inspectors can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'inspection-photos'
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'inspector')
  );

CREATE POLICY "Inspectors can delete their photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'inspection-photos');

-- =============================================
-- Trigger: auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
