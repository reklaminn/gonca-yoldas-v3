/*
  # Fix Program Slugs - Remove Turkish Characters
  
  1. Updates
    - Convert all program slugs to ASCII-safe versions
    - Update related testimonial references
  
  2. Changes
    - bebeğimle-evde-ingilizce → bebegimle-evde-ingilizce
    - çocuğumla-evde-ingilizce → cocugumla-evde-ingilizce
    - çocuklar-için-online-ingilizce → cocuklar-icin-online-ingilizce
*/

-- Update program slugs to ASCII-safe versions
UPDATE programs 
SET slug = 'bebegimle-evde-ingilizce'
WHERE slug = 'bebeğimle-evde-ingilizce';

UPDATE programs 
SET slug = 'cocugumla-evde-ingilizce'
WHERE slug = 'çocuğumla-evde-ingilizce';

UPDATE programs 
SET slug = 'cocuklar-icin-online-ingilizce'
WHERE slug = 'çocuklar-için-online-ingilizce';

-- Update testimonials to match new slugs
UPDATE parent_testimonials 
SET program_slug = 'bebegimle-evde-ingilizce'
WHERE program_slug = 'bebeğimle-evde-ingilizce';

UPDATE parent_testimonials 
SET program_slug = 'cocugumla-evde-ingilizce'
WHERE program_slug = 'çocuğumla-evde-ingilizce';
