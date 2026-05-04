#!/usr/bin/env node

/**
 * Seed do banco local com registros de exemplo.
 *
 * Uso:
 *   node scripts/seed-db.mjs                     # usa user_id do primeiro usuário no banco
 *   node scripts/seed-db.mjs <user_id>           # usa user_id específico
 *
 * Pré-requisitos:
 *   - Docker rodando com supabase-db ativo
 *   - Pelo menos 1 usuário registrado (ou passe o user_id manualmente)
 *
 * O que faz:
 *   1. Limpa todos os registros do usuário
 *   2. Aplica as migrations (supabase/migrations/*.sql)
 *   3. Insere os 222 registros de scripts/seed-registros.json
 *   4. Recarrega o cache do PostgREST
 */

import { execSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const DB_CONTAINER = "supabase-db";
const DB_USER = "supabase_admin";
const DB_NAME = "postgres";
const REST_CONTAINER = "supabase-rest";

// ─── Helpers ───────────────────────────────────────────────

function psql(sql) {
  return execSync(
    `docker exec -i ${DB_CONTAINER} psql -U ${DB_USER} -d ${DB_NAME}`,
    { input: sql, encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 },
  );
}

function log(msg) {
  console.log(`\x1b[36m[seed]\x1b[0m ${msg}`);
}

function logOk(msg) {
  console.log(`\x1b[32m  ✔\x1b[0m ${msg}`);
}

function logErr(msg) {
  console.error(`\x1b[31m  ✘\x1b[0m ${msg}`);
}

// ─── 1. Verificar Docker ───────────────────────────────────

log("Verificando containers Docker...");
try {
  const status = execSync(
    `docker inspect -f '{{.State.Running}}' ${DB_CONTAINER}`,
    { encoding: "utf-8" },
  ).trim();
  if (status !== "true") throw new Error("Container não está running");
  logOk(`${DB_CONTAINER} está rodando`);
} catch {
  logErr(`Container ${DB_CONTAINER} não encontrado ou parado.`);
  logErr("Execute: npm run docker:up");
  process.exit(1);
}

// ─── 2. Descobrir user_id ──────────────────────────────────

let userId = process.argv[2];

if (!userId) {
  log("Buscando primeiro usuário no banco...");
  const result = psql("SELECT id FROM auth.users LIMIT 1;");
  const match = result.match(
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/,
  );
  if (!match) {
    logErr("Nenhum usuário encontrado. Registre um usuário no app primeiro.");
    process.exit(1);
  }
  userId = match[1];
}
logOk(`user_id: ${userId}`);

// ─── 3. Aplicar migrations ─────────────────────────────────

log("Aplicando migrations...");
const migrationsDir = join(ROOT, "supabase", "migrations");
const migrations = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of migrations) {
  const sql = readFileSync(join(migrationsDir, file), "utf-8");
  try {
    psql(sql);
    logOk(file);
  } catch (err) {
    // Ignore "already exists" errors — migrations are idempotent-ish
    if (
      err.stderr?.includes("already exists") ||
      err.stderr?.includes("duplicate")
    ) {
      logOk(`${file} (já aplicada)`);
    } else {
      logErr(`${file}: ${err.stderr || err.message}`);
    }
  }
}

// ─── 4. Limpar registros existentes do usuário ─────────────

log("Limpando registros existentes do usuário...");
const delResult = psql(
  `DELETE FROM registros WHERE user_id = '${userId}'; SELECT 'deleted';`,
);
logOk("Registros anteriores removidos");

// ─── 5. Carregar e inserir seed ────────────────────────────

log("Inserindo registros do seed...");
const seedPath = join(__dirname, "seed-registros.json");
const data = JSON.parse(readFileSync(seedPath, "utf-8"));

// Substituir user_id em todos os registros
const escSql = (s) => (s || "").replace(/'/g, "''");

const values = data.map((r) => {
  const photos =
    "{" + (r.photo_urls || []).map((u) => `"${escSql(u)}"`).join(",") + "}";
  return `('${userId}','${escSql(r.category)}','${escSql(r.title)}','${escSql(r.body || "")}','${escSql(r.event_date)}','${photos}')`;
});

const BATCH = 50;
let inserted = 0;
for (let i = 0; i < values.length; i += BATCH) {
  const batch = values.slice(i, i + BATCH);
  const sql = `INSERT INTO registros (user_id, category, title, body, event_date, photo_urls) VALUES\n${batch.join(",\n")};\n`;
  psql(sql);
  inserted += batch.length;
}
logOk(`${inserted} registros inseridos`);

// ─── 6. Recarregar PostgREST ──────────────────────────────

log("Recarregando cache do PostgREST...");
try {
  execSync(`docker kill -s SIGUSR1 ${REST_CONTAINER}`, { encoding: "utf-8" });
  logOk("PostgREST schema cache recarregado");
} catch {
  logErr("Não foi possível recarregar PostgREST (pode não estar rodando)");
}

// ─── Resumo ────────────────────────────────────────────────

log("Resumo:");
const summary = psql(`
  SELECT count(*) as total FROM registros WHERE user_id = '${userId}';
`);
const countMatch = summary.match(/(\d+)/);
logOk(`Total: ${countMatch?.[1] || "?"} registros para o usuário`);

const breakdown = psql(`
  SELECT category, count(*), 
         sum(case when array_length(photo_urls,1) > 0 then 1 else 0 end) as com_foto
  FROM registros WHERE user_id = '${userId}' GROUP BY category ORDER BY category;
`);
console.log(breakdown);

log("Seed concluído! Faça refresh no app.");
