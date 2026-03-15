#!/bin/bash

# Setup database schema based on environment
# Use PostgreSQL for production (Vercel), SQLite for local development

if [ "$VERCEL" = "1" ] || [ "$NODE_ENV" = "production" ]; then
  echo "🚀 Production environment detected - using PostgreSQL schema"
  SCHEMA="./prisma/schema.postgres.prisma"
else
  echo "💻 Development environment detected - using SQLite schema"
  SCHEMA="./prisma/schema.prisma"
fi

echo "Using schema: $SCHEMA"

# Generate Prisma Client using bunx
bunx prisma generate --schema=$SCHEMA

# Push schema changes (only in production for Vercel)
if [ "$VERCEL" = "1" ] || [ "$NODE_ENV" = "production" ]; then
  echo "Pushing schema to database..."
  bunx prisma db push --accept-data-loss --schema=$SCHEMA
fi
