-- Add missing columns for user profile
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS dietary_restrictions text[],
  ADD COLUMN IF NOT EXISTS available_equipment text[];

-- Update existing policies
DROP POLICY IF EXISTS "Allow access to demo user" ON public.users;

CREATE POLICY "Allow access to demo user"
  ON public.users
  FOR ALL 
  USING (id = '00000000-0000-0000-0000-000000000000')
  WITH CHECK (id = '00000000-0000-0000-0000-000000000000');

-- Add index for faster profile lookups
CREATE INDEX IF NOT EXISTS idx_users_profile 
  ON users(id, onboarding_status);