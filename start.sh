#!/bin/sh
# Resolve any failed migrations before deploying
npx prisma migrate resolve --rolled-back 20240101000000_init 2>/dev/null || true
# Apply migrations
npx prisma migrate deploy
# Start the app
npm run start
