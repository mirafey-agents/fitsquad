-- Add notes column to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS notes text;