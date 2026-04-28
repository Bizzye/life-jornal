/**
 * Seed script: cria 3 imagens de teste, faz upload no Supabase Storage
 * e distribui aleatoriamente nos registros existentes.
 *
 * Uso: node scripts/seed-photos.mjs
 */

import { readFile, writeFile } from "fs/promises";
import { deflateSync } from "zlib";

const SUPABASE_URL = "http://192.168.1.123:8000";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UtZGVtbyIsImlhdCI6MTY0MTc2OTIwMCwiZXhwIjoxNzk5NTM1NjAwfQ.LtpBQGidZd8JIxEANvO0GtftEub5_VEbdma3kewL9jU";
const BUCKET = "entry-photos";
const USER_ID = "0e2b82fc-c129-4522-8434-cc89ffdcd504";

const apiHeaders = {
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  apikey: SERVICE_ROLE_KEY,
};

// ---------- helpers PNG ----------

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const td = Buffer.concat([Buffer.from(type), data]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function createPng(w, h, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2; // 8-bit RGB

  const row = Buffer.alloc(1 + w * 3);
  row[0] = 0; // filter None
  for (let x = 0; x < w; x++) {
    row[1 + x * 3] = r;
    row[2 + x * 3] = g;
    row[3 + x * 3] = b;
  }

  const raw = Buffer.concat(Array(h).fill(row));
  const compressed = deflateSync(raw);

  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------- 1. Criar imagens ----------

async function createTestImages() {
  const specs = [
    { file: "/tmp/seed_red.png", r: 220, g: 50, b: 50 },
    { file: "/tmp/seed_green.png", r: 50, g: 180, b: 80 },
    { file: "/tmp/seed_blue.png", r: 50, g: 80, b: 220 },
  ];
  for (const s of specs) {
    await writeFile(s.file, createPng(400, 300, s.r, s.g, s.b));
  }
  return specs.map((s) => s.file);
}

// ---------- 2. Upload ----------

async function uploadImage(localPath, remoteName) {
  const body = await readFile(localPath);
  const storagePath = `${USER_ID}/${remoteName}`;

  // remove se ja existir
  await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`, {
    method: "DELETE",
    headers: apiHeaders,
  });

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`,
    {
      method: "POST",
      headers: { ...apiHeaders, "Content-Type": "image/png" },
      body,
    },
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Upload falhou ${remoteName}: ${res.status} ${txt}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

// ---------- 3. Atualizar registros ----------

async function updateRegistros(photoUrls) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/registros?select=id,title&order=created_at`,
    { headers: { ...apiHeaders, "Content-Type": "application/json" } },
  );
  const registros = await res.json();
  console.log(`  Encontrados ${registros.length} registros`);

  for (const reg of registros) {
    const count = Math.floor(Math.random() * 3) + 1; // 1-3 fotos
    const shuffled = [...photoUrls].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    const up = await fetch(
      `${SUPABASE_URL}/rest/v1/registros?id=eq.${reg.id}`,
      {
        method: "PATCH",
        headers: {
          ...apiHeaders,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ photo_urls: selected }),
      },
    );

    if (!up.ok) {
      console.error(`  x ${reg.title}: ${await up.text()}`);
    } else {
      console.log(`  ok ${reg.title} -> ${selected.length} foto(s)`);
    }
  }
}

// ---------- main ----------

async function main() {
  console.log("1/3 Criando imagens de teste...");
  const paths = await createTestImages();
  console.log(`  OK: ${paths.join(", ")}`);

  console.log("2/3 Upload para Supabase Storage...");
  const names = ["seed_red.png", "seed_green.png", "seed_blue.png"];
  const urls = [];
  for (let i = 0; i < paths.length; i++) {
    const url = await uploadImage(paths[i], names[i]);
    urls.push(url);
    console.log(`  ok ${url}`);
  }

  console.log("3/3 Atualizando registros...");
  await updateRegistros(urls);
  console.log("\nDone!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
