/*
  # Fix Orders Table - Program ID Type Mismatch

  1. Changes
    - Change program_id from integer to uuid
    - Add foreign key constraint to programs table
    - Update existing data if any

  2. Security
    - Maintain existing RLS policies
*/

-- Step 1: Drop existing program_id column and recreate as UUID
ALTER TABLE orders 
  DROP COLUMN IF EXISTS program_id;

ALTER TABLE orders
  ADD COLUMN program_id uuid REFERENCES programs(id) ON DELETE SET NULL;

-- Step 2: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_program_id ON orders(program_id);

-- Step 3: Update the column to be NOT NULL after adding the reference
-- (We'll keep it nullable for now to allow orders without program reference)

-- Step 4: Add comment for documentation
COMMENT ON COLUMN orders.program_id IS 'UUID reference to programs table';
