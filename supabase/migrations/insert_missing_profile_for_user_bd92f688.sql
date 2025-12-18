/*
  # Insert missing profile row for user bd92f688-ae34-47b9-81d0-4484285d4a24

  1. Data Fix
    - Insert a profile row for the user with id bd92f688-ae34-47b9-81d0-4484285d4a24
    - Set role to 'student' as default
    - Set full_name to 'test' (from user_metadata)
    - Set email_verified to true (from user_metadata)
    - Set updated_at and password_changed_at to now()

  2. Security
    - No schema changes, only data insertion
    - RLS policies already in place to allow user access
*/

INSERT INTO profiles (id, full_name, email_verified, role, updated_at, password_changed_at)
VALUES (
  'bd92f688-ae34-47b9-81d0-4484285d4a24',
  'test',
  true,
  'student',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;
