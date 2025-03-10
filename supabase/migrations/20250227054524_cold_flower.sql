-- Add missing columns to users table for member management
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS start_date date;