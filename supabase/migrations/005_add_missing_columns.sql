-- Migration 005: Add missing columns to match TypeScript types
-- These fields were added to the app for measurement features and inspector assignment

-- Add physical_factors to checklist_category enum
ALTER TYPE checklist_category ADD VALUE IF NOT EXISTS 'physical_factors';

-- Add measurement fields to checklist_template_items
ALTER TABLE checklist_template_items
  ADD COLUMN IF NOT EXISTS input_type TEXT DEFAULT 'check',
  ADD COLUMN IF NOT EXISTS unit TEXT,
  ADD COLUMN IF NOT EXISTS norm_min FLOAT,
  ADD COLUMN IF NOT EXISTS norm_max FLOAT;

-- Add measured_value to inspection_items
ALTER TABLE inspection_items
  ADD COLUMN IF NOT EXISTS measured_value FLOAT;

-- Add inspector_id to projects
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS inspector_id UUID REFERENCES profiles(id);

-- Allow inspectors to view their assigned projects
CREATE POLICY "Inspectors can view assigned projects"
  ON projects FOR SELECT
  USING (inspector_id = auth.uid());

-- Allow inspectors to view templates (needed for inspection flow)
CREATE POLICY "All authenticated users can view templates"
  ON checklist_templates FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can view template items"
  ON checklist_template_items FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow inspectors to view regulations
CREATE POLICY "All authenticated users can view regulations"
  ON regulations FOR SELECT
  USING (auth.role() = 'authenticated');
