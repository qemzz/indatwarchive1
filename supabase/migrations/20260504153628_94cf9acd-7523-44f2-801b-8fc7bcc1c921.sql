UPDATE auth.users
SET encrypted_password = crypt('TempPass123!', gen_salt('bf')),
    updated_at = now()
WHERE email = 'dos@school.com';