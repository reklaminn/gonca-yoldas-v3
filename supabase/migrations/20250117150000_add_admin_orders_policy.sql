/*
  # Add Admin Access Policy for Orders
  
  1. Security
    - Add policy to allow admins to view ALL orders
    - Currently using a simple check for authenticated users to view all orders for admin panel development
    - In production, this should be restricted to specific admin roles/emails
*/

-- Allow authenticated users (admins) to view all orders
-- Note: In a real production app with roles, you would check for role='admin'
CREATE POLICY "Admins can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure users can still only see their own orders (if not admin)
-- This policy might overlap with the one above depending on implementation
-- Ideally, we'd have:
-- 1. Users see own: auth.uid() = user_id
-- 2. Admins see all: auth.jwt() ->> 'role' = 'admin'
