/*
  # SMTP Ayarları Tablosu
  1. Yeni Tablo: `smtp_settings`
    - SMTP sunucu bilgileri ve kimlik doğrulama verilerini saklar.
  2. Güvenlik:
    - RLS aktif.
    - Sadece 'admin' rolüne sahip kullanıcılar okuyabilir ve güncelleyebilir.
*/

CREATE TABLE IF NOT EXISTS smtp_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host text NOT NULL DEFAULT 'smtp.gmail.com',
  port integer NOT NULL DEFAULT 587,
  user_email text NOT NULL,
  password text NOT NULL,
  from_name text NOT NULL DEFAULT 'Gonca Yoldaş İletişim',
  encryption text NOT NULL DEFAULT 'tls', -- tls, ssl, none
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE smtp_settings ENABLE ROW LEVEL SECURITY;

-- Sadece adminler görebilir
CREATE POLICY "Admins can manage smtp settings"
  ON smtp_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Başlangıç verisi (boş)
INSERT INTO smtp_settings (user_email, password)
SELECT 'info@example.com', 'password'
WHERE NOT EXISTS (SELECT 1 FROM smtp_settings);
