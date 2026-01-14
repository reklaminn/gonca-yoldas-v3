/*
  # Add Footer Payment Settings to General Settings

  1. Changes
    - Add footer payment security message field
    - Add payment badge image URL field
    - Add security badges configuration (JSON)
    - Add enable/disable toggles for each badge

  2. New Columns
    - `footer_payment_message` (text) - Security message text
    - `footer_payment_badge_url` (text) - Payment provider badge image URL
    - `footer_security_badges` (jsonb) - Configuration for SSL, 3D Secure, PCI DSS badges
*/

-- Add new columns to general_settings table
ALTER TABLE general_settings
ADD COLUMN IF NOT EXISTS footer_payment_message text DEFAULT 'Ödeme bilgileriniz 256-bit SSL sertifikası ile şifrelenir ve güvenli bir şekilde işlenir.',
ADD COLUMN IF NOT EXISTS footer_payment_badge_url text DEFAULT 'https://www.esasartdesign.com/contents/img/temp/logo-band_iyzico_ile_ode1x.png',
ADD COLUMN IF NOT EXISTS footer_security_badges jsonb DEFAULT '[
  {"id": "ssl", "label": "SSL Güvenliği", "enabled": true},
  {"id": "3d_secure", "label": "3D Secure", "enabled": true},
  {"id": "pci_dss", "label": "PCI DSS", "enabled": true}
]'::jsonb;

-- Update existing row with default values if they don't exist
UPDATE general_settings
SET 
  footer_payment_message = COALESCE(footer_payment_message, 'Ödeme bilgileriniz 256-bit SSL sertifikası ile şifrelenir ve güvenli bir şekilde işlenir.'),
  footer_payment_badge_url = COALESCE(footer_payment_badge_url, 'https://www.esasartdesign.com/contents/img/temp/logo-band_iyzico_ile_ode1x.png'),
  footer_security_badges = COALESCE(footer_security_badges, '[
    {"id": "ssl", "label": "SSL Güvenliği", "enabled": true},
    {"id": "3d_secure", "label": "3D Secure", "enabled": true},
    {"id": "pci_dss", "label": "PCI DSS", "enabled": true}
  ]'::jsonb)
WHERE footer_payment_message IS NULL 
   OR footer_payment_badge_url IS NULL 
   OR footer_security_badges IS NULL;
