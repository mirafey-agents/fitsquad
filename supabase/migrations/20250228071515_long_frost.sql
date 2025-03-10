-- Create demo user if not exists
INSERT INTO auth.users (id, email)
VALUES ('00000000-0000-0000-0000-000000000000', 'demo@example.com')
ON CONFLICT (id) DO NOTHING;

-- Create user profile if not exists
INSERT INTO public.users (
  id, 
  email, 
  display_name,
  role,
  onboarding_status
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'demo@example.com',
  'Demo User',
  'member',
  'pending'
)
ON CONFLICT (id) DO NOTHING;