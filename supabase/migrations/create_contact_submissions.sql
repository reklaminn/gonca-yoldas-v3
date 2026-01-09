/*
  # Create Contact Submissions Table
  
  1. New Tables
    - `contact_submissions`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `subject` (text)
      - `message` (text)
      - `ip_address` (text)
      - `referer_page` (text)
      - `status` (text) - default: 'new'
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `contact_submissions` table
    - Add policy for public insert (anyone can submit contact form)
    - Add policy for admin read (only authenticated users can read)
*/

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  ip_address text,
  referer_page text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Herkesin (giriş yapmamış kullanıcıların da) form gönderebilmesi için
CREATE POLICY "Anyone can insert contact submissions" 
ON contact_submissions 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Sadece yetkili kullanıcıların okuyabilmesi için (Admin paneli vs. için)
CREATE POLICY "Authenticated users can view submissions" 
ON contact_submissions 
FOR SELECT 
TO authenticated 
USING (true);
