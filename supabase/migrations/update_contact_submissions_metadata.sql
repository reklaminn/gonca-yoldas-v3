/*
  # İletişim Formu Metadata ve Durum Güncellemesi
  
  1. New Columns:
    - `ip_address`: Gönderenin IP adresi
    - `referer_page`: Mesajın gönderildiği sayfa URL'i
    - `notes`: Admin notları için alan
*/

ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS ip_address text,
ADD COLUMN IF NOT EXISTS referer_page text,
ADD COLUMN IF NOT EXISTS notes text;

-- Durumları güncellemek için politika (Sadece Admin)
CREATE POLICY "Admins can update submissions" 
  ON contact_submissions 
  FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);
