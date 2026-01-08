-- Seed data for supply categories
-- This file creates the 13 supply categories for the medical inventory system

-- Note: Using a demo agency ID that should exist in the system
-- Agency ID: 11111111-1111-1111-1111-111111111111

INSERT INTO supply_categories (id, name, color, description, agency_id, created_at, updated_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'Airway Management', '#3B82F6', 'Airway management equipment and supplies', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'IV/Vascular Access', '#8B5CF6', 'IV and vascular access supplies', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 'IO Access', '#7C3AED', 'Intraosseous access equipment', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', 'Cardiac/Monitoring', '#EC4899', 'Cardiac and patient monitoring supplies', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 'Wound Care/Bandaging', '#F97316', 'Wound care and bandaging supplies', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', 'Obstetrics', '#F43F5E', 'Obstetric supplies and equipment', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa07', 'Splinting/Immobilization', '#EAB308', 'Splinting and immobilization equipment', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa08', 'Patient Care', '#14B8A6', 'General patient care supplies', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa09', 'PPE', '#10B981', 'Personal protective equipment', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa10', 'Cleaning/Sanitation', '#6B7280', 'Cleaning and sanitation supplies', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa11', 'Documentation', '#64748B', 'Documentation and administrative supplies', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa12', 'Glucose Testing', '#EF4444', 'Glucose testing supplies', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa13', 'Miscellaneous', '#9CA3AF', 'Miscellaneous supplies', '11111111-1111-1111-1111-111111111111', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
