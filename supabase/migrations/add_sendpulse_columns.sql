/*
  # Add SendPulse Columns to Programs Table
  1. New Columns:
     - sendpulse_id (text): Main course ID in SendPulse
     - sendpulse_upsell_id (text): Default upsell course ID in SendPulse
  2. Purpose:
     - To map local programs to SendPulse courses for automation
*/

ALTER TABLE programs ADD COLUMN IF NOT EXISTS sendpulse_id text;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS sendpulse_upsell_id text;
