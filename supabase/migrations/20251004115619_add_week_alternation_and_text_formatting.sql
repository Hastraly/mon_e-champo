/*
  # Add Week Alternation and Text Formatting

  ## Overview
  This migration adds support for week alternation (week 1/week 2), recurrence patterns,
  and rich text formatting for todos.

  ## Changes to Existing Tables

  ### `schedule_entries`
  - Add `week_type` column - Which week(s) this entry applies to ('both', 'week1', 'week2')
  - Add `recurrence` column - Recurrence pattern ('none', 'weekly', 'biweekly')

  ### `todos`
  - Add `formatting` column - JSON object storing text formatting (bold, italic, underline, highlight color)

  ## Security
  - Existing RLS policies continue to apply
  - All new columns have safe default values
*/

-- Add week_type column to schedule_entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schedule_entries' AND column_name = 'week_type'
  ) THEN
    ALTER TABLE schedule_entries 
    ADD COLUMN week_type text DEFAULT 'both' CHECK (week_type IN ('both', 'week1', 'week2'));
  END IF;
END $$;

-- Add recurrence column to schedule_entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schedule_entries' AND column_name = 'recurrence'
  ) THEN
    ALTER TABLE schedule_entries 
    ADD COLUMN recurrence text DEFAULT 'none' CHECK (recurrence IN ('none', 'weekly', 'biweekly'));
  END IF;
END $$;

-- Add formatting column to todos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'formatting'
  ) THEN
    ALTER TABLE todos 
    ADD COLUMN formatting jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;