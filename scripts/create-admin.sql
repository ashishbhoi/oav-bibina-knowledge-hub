-- Delete existing admin user if any
DELETE
FROM Admin
WHERE username = 'admin';

-- Insert new admin user with proper bcrypt hash
-- Username: admin
-- Password: admin123
INSERT INTO Admin (id, username, password_hash)
VALUES (1,
        'admin',
        '$2b$12$QEdeSv1sLJINT6wD0YAXGuew18tNcBuQg547nWU5m6eu28g5SGb9m');
