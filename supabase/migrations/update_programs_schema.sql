/*
  # Update programs table schema
  
  1. Changes
    - Add missing columns that might be causing 400 Bad Request errors
    - Ensure all columns used in the form exist in the database
    - Add columns: iyzilink, title_en, short_title, lesson_duration, lessons_per_week, max_students, sort_order
*/

DO $$ 
BEGIN 
  -- Add iyzilink if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'iyzilink') THEN
    ALTER TABLE programs ADD COLUMN iyzilink text;
  END IF;

  -- Add title_en if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'title_en') THEN
    ALTER TABLE programs ADD COLUMN title_en text;
  END IF;

  -- Add short_title if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'short_title') THEN
    ALTER TABLE programs ADD COLUMN short_title text;
  END IF;

  -- Add lesson_duration if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'lesson_duration') THEN
    ALTER TABLE programs ADD COLUMN lesson_duration text;
  END IF;

  -- Add lessons_per_week if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'lessons_per_week') THEN
    ALTER TABLE programs ADD COLUMN lessons_per_week integer DEFAULT 1;
  END IF;

  -- Add max_students if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'max_students') THEN
    ALTER TABLE programs ADD COLUMN max_students integer DEFAULT 10;
  END IF;

  -- Add sort_order if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'sort_order') THEN
    ALTER TABLE programs ADD COLUMN sort_order integer DEFAULT 0;
  END IF;

  -- Add featured if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'featured') THEN
    ALTER TABLE programs ADD COLUMN featured boolean DEFAULT false;
  END IF;

  -- Add status if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'status') THEN
    ALTER TABLE programs ADD COLUMN status text DEFAULT 'draft';
  END IF;

END $$;