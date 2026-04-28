#!/bin/bash
# Setup script para baixar os arquivos de volume do repositório oficial do Supabase.
# Rode uma vez antes do primeiro `docker compose up -d`.
#
# Uso: chmod +x setup.sh && ./setup.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BASE_URL="https://raw.githubusercontent.com/supabase/supabase/master/docker/volumes"

echo "📦 Criando diretórios..."
mkdir -p volumes/api
mkdir -p volumes/db
mkdir -p volumes/logs
mkdir -p volumes/pooler
mkdir -p volumes/functions
mkdir -p volumes/storage

echo "⬇️  Baixando arquivos de configuração do Supabase oficial..."

# Kong API Gateway
echo "  → Kong config..."
curl -sL "$BASE_URL/api/kong.yml" -o volumes/api/kong.yml
curl -sL "$BASE_URL/api/kong-entrypoint.sh" -o volumes/api/kong-entrypoint.sh
chmod +x volumes/api/kong-entrypoint.sh

# Database init scripts
echo "  → DB init scripts..."
curl -sL "$BASE_URL/db/jwt.sql" -o volumes/db/jwt.sql
curl -sL "$BASE_URL/db/roles.sql" -o volumes/db/roles.sql
curl -sL "$BASE_URL/db/realtime.sql" -o volumes/db/realtime.sql
curl -sL "$BASE_URL/db/webhooks.sql" -o volumes/db/webhooks.sql
curl -sL "$BASE_URL/db/_supabase.sql" -o volumes/db/_supabase.sql
curl -sL "$BASE_URL/db/logs.sql" -o volumes/db/logs.sql
curl -sL "$BASE_URL/db/pooler.sql" -o volumes/db/pooler.sql

# Vector (logging)
echo "  → Vector config..."
curl -sL "$BASE_URL/logs/vector.yml" -o volumes/logs/vector.yml

# Supavisor (pooler)
echo "  → Pooler config..."
curl -sL "$BASE_URL/pooler/pooler.exs" -o volumes/pooler/pooler.exs

# Edge Functions main entrypoint (mínimo para o container iniciar)
if [ ! -f volumes/functions/main/index.ts ]; then
  echo "  → Edge Functions entrypoint..."
  mkdir -p volumes/functions/main
  cat > volumes/functions/main/index.ts << 'EOF'
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req: Request) => {
  return new Response("ok", { status: 200 });
});
EOF
fi

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Próximos passos:"
echo "  1. Edite o arquivo .env com suas senhas (POSTGRES_PASSWORD, JWT_SECRET, etc.)"
echo "  2. Gere novas API keys em: https://supabase.com/docs/guides/self-hosting/docker#api-keys"
echo "  3. Inicie com: docker compose up -d"
echo "  4. Acesse o Studio em: http://localhost:8000"
echo "  5. A API estará em: http://localhost:8000"
echo ""
echo "Para aplicar as migrations do projeto:"
echo "  psql postgresql://postgres:YOUR_PASSWORD@localhost:54322/postgres -f ../supabase/migrations/*.sql"
