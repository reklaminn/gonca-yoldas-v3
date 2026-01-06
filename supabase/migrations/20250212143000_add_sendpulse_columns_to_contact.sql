/*
  # Add SendPulse Tracking to Contact Submissions
  
  Checkout (Orders) yapısındaki gibi, iletişim formlarının da SendPulse gönderim durumunu
  veritabanında takip etmek için gerekli sütunları ekler.
*/

ALTER TABLE IF EXISTS contact_submissions 
ADD COLUMN IF NOT EXISTS sendpulse_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sendpulse_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS sendpulse_error text;