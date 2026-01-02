/*
  # Fix Age Groups Primary Key
  
  1. Changes
    - Ensures `id` column exists and is NOT NULL
    - Adds PRIMARY KEY constraint to `age_groups` table if it's missing
    - Ensures `value` column is UNIQUE
  
  This fixes the "No Primary Key" error when trying to insert/update records.
*/

DO $$
BEGIN
  -- 1. Ensure id column exists and has a default value
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'age_groups' AND column_name = 'id') THEN
    ALTER TABLE age_groups ADD COLUMN id uuid DEFAULT gen_random_uuid();
  END IF;

  -- 2. Ensure id is NOT NULL
  ALTER TABLE age_groups ALTER COLUMN id SET NOT NULL;
  ALTER TABLE age_groups ALTER COLUMN id SET DEFAULT gen_random_uuid();

  -- 3. Add Primary Key constraint if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'age_groups_pkey') THEN
    -- First, ensure all existing rows have an ID (just in case)
    UPDATE age_groups SET id = gen_random_uuid() WHERE id IS NULL;
    -- Add the constraint
    ALTER TABLE age_groups ADD CONSTRAINT age_groups_pkey PRIMARY KEY (id);
  END IF;

  -- 4. Ensure value is unique (to prevent duplicates)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'age_groups_value_key') THEN
    ALTER TABLE age_groups ADD CONSTRAINT age_groups_value_key UNIQUE (value);
  END IF;

END $$;
