/*
  # Fix Contact Submissions Table and RLS
  
  1. Tablo yoksa oluşturur.
  2. Eksik sütunları ekler.
  3. RLS (Satır Düzeyinde Güvenlik) açar.
  4. Herkesin (anonim kullanıcılar dahil) form gönderebilmesi için INSERT politikası ekler.
*/

-- 1. Tabloyu oluştur (Eğer yoksa)
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text,
  email text,
  phone text,
  subject text,
  message text,
  ip_address text,
  referer_page text,
  status text DEFAULT 'new'
);

-- 2. SendPulse takip sütunlarını ekle (Eğer yoksa)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_submissions' AND column_name = 'sendpulse_sent') THEN
        ALTER TABLE contact_submissions ADD COLUMN sendpulse_sent boolean DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_submissions' AND column_name = 'sendpulse_sent_at') THEN
        ALTER TABLE contact_submissions ADD COLUMN sendpulse_sent_at timestamptz;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_submissions' AND column_name = 'sendpulse_error') THEN
        ALTER TABLE contact_submissions ADD COLUMN sendpulse_error text;
    END IF;
END $$;

-- 3. RLS'i Aktif Et
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- 4. Politikaları Temizle ve Yeniden Oluştur
DROP POLICY IF EXISTS "Allow public insert on contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow service role full access on contact_submissions" ON contact_submissions;

-- Herkesin ekleme yapmasına izin ver (Anonim ve Giriş yapmış kullanıcılar)
CREATE POLICY "Allow public insert on contact_submissions" 
ON contact_submissions 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Service Role (Edge Function) için tam yetki (Genelde bypass eder ama garanti olsun)
CREATE POLICY "Allow service role full access on contact_submissions"
ON contact_submissions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);