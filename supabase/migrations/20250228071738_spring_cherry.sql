-- First, temporarily alter the constraints
ALTER TABLE squads ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE workout_plans ALTER COLUMN created_by DROP NOT NULL;

-- Update any foreign key references to the demo user
UPDATE squads SET created_by = NULL WHERE created_by = '00000000-0000-0000-0000-000000000000';
UPDATE workout_plans SET created_by = NULL WHERE created_by = '00000000-0000-0000-0000-000000000000';
UPDATE invoice_templates SET created_by = NULL WHERE created_by = '00000000-0000-0000-0000-000000000000';
UPDATE payment_methods SET created_by = NULL WHERE created_by = '00000000-0000-0000-0000-000000000000';

-- Now we can safely delete the demo user
DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000000';
DELETE FROM public.users WHERE id = '00000000-0000-0000-0000-000000000000';

-- Create demo user
INSERT INTO auth.users (id, email, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'demo@example.com', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Create user profile
INSERT INTO public.users (
  id, 
  email, 
  display_name,
  role,
  onboarding_status,
  service_type
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'demo@example.com',
  'Demo User',
  'member',
  'pending',
  'Personal Training'
)
ON CONFLICT (id) DO NOTHING;

-- Add policy to allow access to demo user
CREATE POLICY "Allow access to demo user"
  ON public.users
  FOR ALL 
  USING (id = '00000000-0000-0000-0000-000000000000')
  WITH CHECK (id = '00000000-0000-0000-0000-000000000000');

-- Restore the foreign key references
UPDATE squads SET created_by = '00000000-0000-0000-0000-000000000000' WHERE created_by IS NULL;
UPDATE workout_plans SET created_by = '00000000-0000-0000-0000-000000000000' WHERE created_by IS NULL;
UPDATE invoice_templates SET created_by = '00000000-0000-0000-0000-000000000000' WHERE created_by IS NULL;
UPDATE payment_methods SET created_by = '00000000-0000-0000-0000-000000000000' WHERE created_by IS NULL;

-- Restore the not-null constraints
ALTER TABLE squads ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE workout_plans ALTER COLUMN created_by SET NOT NULL;