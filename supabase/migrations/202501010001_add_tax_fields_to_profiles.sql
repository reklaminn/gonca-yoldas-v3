/*
  # Add Tax Fields to Profiles
  1. New Columns: tax_office, tax_number added to profiles table.
  2. Purpose: To store user's tax information for invoicing, consistent with checkout form.
*/
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS tax_office text DEFAULT '',
ADD COLUMN IF NOT EXISTS tax_number text DEFAULT '';
