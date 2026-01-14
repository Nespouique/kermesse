-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE IF NOT EXISTS "participants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "bets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "participant_id" UUID NOT NULL,
    "is_male" BOOLEAN NOT NULL,
    "estimated_date" DATE NOT NULL,
    "weight_kg" DECIMAL NOT NULL,
    "baby_first_name" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER,
    "rang_date" INTEGER,
    "rang_poids" INTEGER,
    "rang_sexe" INTEGER,

    CONSTRAINT "bets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "avatars" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bet_id" UUID NOT NULL,
    "top_layer" TEXT,
    "middle_layer" TEXT,
    "bottom_layer" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avatars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "app_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "is_born" BOOLEAN NOT NULL DEFAULT false,
    "baby_name" TEXT,
    "birth_date" TIMESTAMPTZ(6),
    "weight_kg" DECIMAL,
    "height_cm" DECIMAL,
    "sex" TEXT,

    CONSTRAINT "app_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "participants_email_key" ON "participants"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "bets_participant_id_key" ON "bets"("participant_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "avatars_bet_id_key" ON "avatars"("bet_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_bets_participant_id" ON "bets"("participant_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_avatars_bet_id" ON "avatars"("bet_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_bets_estimated_date" ON "bets"("estimated_date");

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avatars" ADD CONSTRAINT "avatars_bet_id_fkey" FOREIGN KEY ("bet_id") REFERENCES "bets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Insert default config
INSERT INTO "app_config" ("id", "is_born") VALUES (1, false) ON CONFLICT ("id") DO NOTHING;
