/*
  # Add Coupon Enabled Field to General Settings

  1. Changes
    - Add `coupon_enabled` boolean field to `general_settings` table
    - Default value: true (coupons enabled by default)

  2. Security
    - Existing RLS policies apply
*/

-- Add coupon_enabled field
ALTER TABLE general_settings
ADD COLUMN IF NOT EXISTS coupon_enabled boolean NOT NULL DEFAULT true;

-- Update existing row if it exists
UPDATE general_settings
SET coupon_enabled = true
WHERE coupon_enabled IS NULL;
