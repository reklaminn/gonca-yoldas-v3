/*
  # Add SendPulse IDs to Programs Table
  
  1. New Columns:
     - `sendpulse_id` (text): The specific Course ID from SendPulse system
     - `sendpulse_upsell_id` (text): Optional Upsell Course ID from SendPulse
  
  2. Purpose:
     - Allows mapping internal Supabase programs to external SendPulse automation courses.
*/

ALTER TABLE programs ADD COLUMN IF NOT EXISTS sendpulse_id text;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS sendpulse_upsell_id text;
