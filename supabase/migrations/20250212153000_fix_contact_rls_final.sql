/*
  # Fix Contact Submissions RLS - Final (Collision Fix)
  
  1. Reset Policies: Drops ALL existing policies, including the one causing the collision.
  2. Public Insert: Re-creates the policy to allow 'anon' and 'authenticated' roles to INSERT.
  3. Service Role: Grants full access to the service role.
*/

-- RLS'i garantiye al
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle (Çakışmaları önlemek için TÜM olası isimleri siliyoruz)
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can view submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow public insert on contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow service role full access on contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Enable insert for all users" ON contact_submissions; -- Çakışan politika
DROP POLICY IF EXISTS "Enable full access for service role" ON contact_submissions; -- Çakışan politika

-- 1. HERKESİN (Anonim dahil) form gönderebilmesi için politika
CREATE POLICY "Enable insert for all users" 
ON contact_submissions 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 2. Sadece Service Role (Admin/Edge Functions) okuyabilir ve düzenleyebilir
CREATE POLICY "Enable full access for service role" 
ON contact_submissions 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);
