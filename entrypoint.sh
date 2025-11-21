#!/bin/sh
set -e

echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "Database started"

flask create-tables

echo "Attempting to insert data from data.sql..."
psql "$DATABASE_URL" -f /app/data.sql

exec "$@"
