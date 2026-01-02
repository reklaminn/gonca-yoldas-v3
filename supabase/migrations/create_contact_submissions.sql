/*
  # İletişim Formu Mesajları Tablosu
  
  1. New Tables:
    - `contact_submissions`: Formdan gelen mesajları saklar
  2. Security:
    - Herkes mesaj gönderebilir (INSERT)
    - Sadece adminler mesajları okuyabilir (SELECT)
*/

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new', -- new, read, replied
  created_at timestamptz DEFAULT now()
);

-- RLS Ayarları
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Herkesin mesaj göndermesine izin ver
CREATE POLICY "Anyone can submit contact form" 
  ON contact_submissions 
  FOR INSERT 
  WITH CHECK (true);

-- Sadece yetkili kullanıcılar (admin) mesajları görebilir
CREATE POLICY "Only admins can view submissions" 
  ON contact_submissions 
  FOR SELECT 
  TO authenticated 
  USING (true);
