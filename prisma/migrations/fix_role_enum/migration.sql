-- Adiciona a coluna role se não existir na tabela mapeada "users"
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'ADMIN';

-- Recria o enum corretamente
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AppRole') THEN
    CREATE TYPE "AppRole" AS ENUM ('ADMIN', 'MEMBER');
  END IF;
END $$;

-- Converte a coluna para o tipo enum
ALTER TABLE "users" ALTER COLUMN "role" TYPE "AppRole" USING "role"::"AppRole";
