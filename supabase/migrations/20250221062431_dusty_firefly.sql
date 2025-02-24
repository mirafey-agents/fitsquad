/*
  # Add Trainer Profile Fields

  1. Changes
    - Add trainer-specific fields to users table:
      - bio: Trainer's biography and experience
      - certification: Professional certification details
      - specializations: Array of training specializations
      - experience: Years of experience
      - hourly_rate: Trainer's hourly rate
  
  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS certification text,
ADD COLUMN IF NOT EXISTS specializations text[],
ADD COLUMN IF NOT EXISTS experience text,
ADD COLUMN IF NOT EXISTS hourly_rate decimal(10,2);

-- Update RLS policies to allow trainers to update their own profile
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);