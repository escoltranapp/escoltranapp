-- AlterTable: add new fields to contacts
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "empresa" TEXT;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "cargo" TEXT;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'lead';
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "etapaFunil" TEXT NOT NULL DEFAULT 'Lead';
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "canalOrigem" TEXT;
