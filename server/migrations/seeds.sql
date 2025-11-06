INSERT INTO users (id, name, email, address, password_hash, role)
VALUES
(gen_random_uuid(), 'System Administrator Account', 'admin@example.com', 'Admin Address', '$2b$10$ReplaceWithRealHash', 'system_admin')
ON CONFLICT DO NOTHING;
