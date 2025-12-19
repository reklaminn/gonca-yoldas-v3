/*
  # Add Detailed Billing Fields to Profiles
  1. New Columns:
    - billing_type: 'individual' or 'corporate'
    - tc_number: For individual billing
    - company_name: For corporate billing
    - full_address: Detailed address for invoicing
  2. Purpose: To support professional invoicing for both individual and corporate customers.
*/

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS billing_type text DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS tc_number text DEFAULT '',
ADD COLUMN IF NOT EXISTS company_name text DEFAULT '',
ADD COLUMN IF NOT EXISTS full_address text DEFAULT '';
