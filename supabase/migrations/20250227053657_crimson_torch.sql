-- Add primary_goal column to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS primary_goal text;