-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table participants
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table bets
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID UNIQUE REFERENCES participants(id),
  is_male BOOLEAN NOT NULL,
  estimated_date DATE NOT NULL,
  weight_kg NUMERIC NOT NULL CHECK (weight_kg >= 0 AND weight_kg <= 99.9),
  baby_first_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  score INTEGER,
  rang_date INTEGER,
  rang_poids INTEGER,
  rang_sexe INTEGER
);

-- Table avatars
CREATE TABLE avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_id UUID UNIQUE REFERENCES bets(id),
  top_layer TEXT,
  middle_layer TEXT,
  bottom_layer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table app_config (singleton)
CREATE TABLE app_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  is_born BOOLEAN DEFAULT FALSE,
  baby_name TEXT,
  birth_date TIMESTAMPTZ,
  weight_kg NUMERIC,
  height_cm NUMERIC,
  sex TEXT
);

-- Insérer la config par défaut
INSERT INTO app_config (id, is_born) VALUES (1, FALSE);

-- Vue v_bets (colonnes aliasées pour correspondre au frontend)
CREATE VIEW v_bets AS
SELECT
  b.id,
  b.participant_id,
  b.is_male,
  b.estimated_date,
  b.weight_kg,
  b.baby_first_name,
  b.created_at,
  b.score,
  b.rang_date,
  b.rang_poids,
  b.rang_sexe,
  p.email,
  p.first_name AS participant_first_name,
  p.last_name AS participant_last_name,
  a.top_layer,
  a.middle_layer,
  a.bottom_layer
FROM bets b
LEFT JOIN participants p ON b.participant_id = p.id
LEFT JOIN avatars a ON a.bet_id = b.id;

-- Index pour les performances
CREATE INDEX idx_bets_participant_id ON bets(participant_id);
CREATE INDEX idx_avatars_bet_id ON avatars(bet_id);
CREATE INDEX idx_bets_estimated_date ON bets(estimated_date);
