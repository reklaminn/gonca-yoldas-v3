/*
  # Remove strict age_group constraint (Safety Check)
  
  1. Changes
    - Drop the check constraint "programs_age_group_check" from programs table if it exists
    - This ensures the fix is applied even if the previous attempt was missed
*/

ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_age_group_check;
