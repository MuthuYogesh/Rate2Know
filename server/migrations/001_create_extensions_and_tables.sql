-- migrations/001_create_extensions_and_tables_neon.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Roles as enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('system_admin','normal_user','store_owner');
  END IF;
END$$;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 20 AND 60),
  email TEXT NOT NULL UNIQUE,
  address TEXT DEFAULT '' CHECK (char_length(address) <= 400),
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'normal_user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Stores
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  address TEXT DEFAULT '' CHECK (char_length(address) <= 400),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ratings
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, store_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users (lower(email));
CREATE INDEX IF NOT EXISTS idx_users_name ON users (lower(name));
CREATE INDEX IF NOT EXISTS idx_stores_name ON stores (lower(name));
CREATE INDEX IF NOT EXISTS idx_stores_address ON stores (lower(address));
CREATE INDEX IF NOT EXISTS idx_ratings_store ON ratings (store_id);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_users ON users;
CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_stores ON stores;
CREATE TRIGGER set_timestamp_stores BEFORE UPDATE ON stores
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_ratings ON ratings;
CREATE TRIGGER set_timestamp_ratings BEFORE UPDATE ON ratings
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
