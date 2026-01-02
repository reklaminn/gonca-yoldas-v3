/*
  # Force Schema Cache Refresh
  
  1. Changes
    - Ensure sort_order column exists
    - Force PostgREST schema cache reload via DDL (COMMENT ON)
*/

DO $$
BEGIN
    -- 1. Ensure sort_order column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'age_groups' AND column_name = 'sort_order') THEN
        ALTER TABLE age_groups ADD COLUMN sort_order integer DEFAULT 0;
    END IF;

    -- 2. Force cache refresh by modifying table metadata
    COMMENT ON TABLE age_groups IS 'Age groups for program filtering (Cache Refreshed)';
END $$;
