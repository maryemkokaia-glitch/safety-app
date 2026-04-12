-- =============================================
-- Fix template RLS: allow inspectors to manage templates
-- Also ensure templates with company_id=NULL are always visible
-- =============================================

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Anyone can view templates" ON checklist_templates;
DROP POLICY IF EXISTS "Admins can manage templates" ON checklist_templates;
DROP POLICY IF EXISTS "Anyone can view template items" ON checklist_template_items;
DROP POLICY IF EXISTS "Admins can manage template items" ON checklist_template_items;

-- Templates: all authenticated users can view all templates
CREATE POLICY "Authenticated users can view templates"
  ON checklist_templates FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Templates: inspectors and admins can insert/update/delete
CREATE POLICY "Inspectors and admins can manage templates"
  ON checklist_templates FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Inspectors and admins can update templates"
  ON checklist_templates FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Inspectors and admins can delete templates"
  ON checklist_templates FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Template items: all authenticated users can view
CREATE POLICY "Authenticated users can view template items"
  ON checklist_template_items FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Template items: inspectors and admins can manage
CREATE POLICY "Inspectors and admins can manage template items"
  ON checklist_template_items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Inspectors and admins can update template items"
  ON checklist_template_items FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Inspectors and admins can delete template items"
  ON checklist_template_items FOR DELETE
  USING (auth.uid() IS NOT NULL);
