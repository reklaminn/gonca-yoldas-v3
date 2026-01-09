/*
  # Remove strict age_group constraint
  
  1. Changes
    - Drop the check constraint "programs_age_group_check" from programs table
    - This allows any age group string to be saved, preventing errors when new age groups are added in the frontend
*/

ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_age_group_check;
