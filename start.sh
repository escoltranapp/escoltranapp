#!/bin/sh
set -e

echo "Sincronizando banco de dados no Easypanel..."
npx prisma db push --accept-data-loss

echo "Iniciando aplicação..."
npm run start
