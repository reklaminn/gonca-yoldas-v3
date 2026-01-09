/*
  # Add SendPulse ID to programs table
  1. Changes: Add `sendpulse_id` column to `programs` table
*/
ALTER TABLE programs ADD COLUMN IF NOT EXISTS sendpulse_id text;
