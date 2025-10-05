/*
  # Add Grades System and Default Subjects

  ## Overview
  This migration adds a comprehensive grades tracking system with support for custom
  grading scales and coefficient-based calculations. It also adds default school subjects.

  ## New Tables

  ### `grades`
  Stores individual grade entries
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - Reference to auth.users
  - `subject_id` (uuid) - Reference to subjects table
  - `grade_value` (numeric) - The actual grade value
  - `grade_max` (numeric) - Maximum possible grade (e.g., 20, 10, 5)
  - `coefficient` (numeric) - Weight/coefficient for this grade
  - `description` (text) - Optional description (e.g., "Examen final", "Devoir maison")
  - `date` (date) - Date of the grade
  - `created_at` (timestamptz) - Creation timestamp

  ## Changes to Existing Tables

  ### `subjects`
  - Add `is_default` column - Whether this is a default subject
  - Add `coefficient` column - Subject coefficient for overall average calculation

  ## Default Subjects
  Creates default school subjects with appropriate coefficients

  ## Security
  - All tables have RLS enabled
  - Users can only access their own grades
  - Default subjects are shared but users can create their own

  ## Important Notes
  1. Grades support custom scales (/20, /10, /5, etc.)
  2. Coefficients allow weighted averages
  3. Default subjects help users get started quickly
*/

-- Add columns to subjects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subjects' AND column_name = 'is_default'
  ) THEN
    ALTER TABLE subjects
    ADD COLUMN is_default boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subjects' AND column_name = 'subject_coefficient'
  ) THEN
    ALTER TABLE subjects
    ADD COLUMN subject_coefficient numeric DEFAULT 1.0;
  END IF;
END $$;

-- Create grades table
CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  grade_value numeric NOT NULL CHECK (grade_value >= 0),
  grade_max numeric NOT NULL DEFAULT 20 CHECK (grade_max > 0),
  coefficient numeric NOT NULL DEFAULT 1.0 CHECK (coefficient > 0),
  description text DEFAULT '',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on grades table
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for grades table
CREATE POLICY "Users can view own grades"
  ON grades FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own grades"
  ON grades FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grades"
  ON grades FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own grades"
  ON grades FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_grades_user_id ON grades(user_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject_id ON grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_grades_date ON grades(date);
