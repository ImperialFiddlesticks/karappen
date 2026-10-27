CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  program       TEXT,
  year          INTEGER,
  dietary       TEXT,
  role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  description      TEXT,
  starts_at        TIMESTAMPTZ NOT NULL,
  location         TEXT NOT NULL,
  max_participants INTEGER CHECK (max_participants > 0),
  created_by       INTEGER NOT NULL REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registrations (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_program_year_check'
  ) THEN
    UPDATE users SET year = NULL WHERE year IS NOT NULL;
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_year_check;
    ALTER TABLE users
      ADD CONSTRAINT users_program_year_check CHECK (year BETWEEN 0 AND 99);
  END IF;
END $$;
