/*
  # Add metadata column to orders table
  1. Changes: Add `metadata` jsonb column to `orders` table to store custom field answers
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'metadata') THEN
    ALTER TABLE orders ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;
