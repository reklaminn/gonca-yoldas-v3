/*
  # Add Iyzilink column to programs table
  1. Changes: Add `iyzilink` column (text, nullable) to `programs` table
*/
ALTER TABLE programs ADD COLUMN IF NOT EXISTS iyzilink text;
