import { readFile } from "fs/promises";

const SUPABASE_URL = "http://192.168.1.123:8000";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UtZGVtbyIsImlhdCI6MTY0MTc2OTIwMCwiZXhwIjoxNzk5NTM1NjAwfQ.LtpBQGidZd8JIxEANvO0GtftEub5_VEbdma3kewL9jU";
const BUCKET = "entry-photos";
const USER_ID = "0e2b82fc-c129-4522-8434-cc89ffdcd504";

const hdrs = {
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  apikey: SERVICE_ROLE_KEY,
};

const IMAGES = [
  { local: "img/donkanonji.jpg", remote: "donkanonji.jpg", mime: "image/jpeg" },
  { local: "img/download.jpeg", remote: "carlton.jpeg", mime: "image/jpeg" },
  { local: "img/memeShrek.jpg", remote: "shrek_will.jpg", mime: "image/jpeg" },
];

async function uploadImages() {
  const urls = [];
  for (const img of IMAGES) {
    const body = await readFile(img.local);
    const path = `${USER_ID}/${img.remote}`;

    // delete if exists
    await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: "DELETE",
      headers: hdrs,
    });

    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`,
      {
        method: "POST",
        headers: { ...hdrs, "Content-Type": img.mime },
        body,
      },
    );

    if (!res.ok) {
      throw new Error(
        `Upload ${img.remote}: ${res.status} ${await res.text()}`,
      );
    }

    const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
    urls.push(url);
    console.log(`  ok ${img.remote} -> ${url}`);
  }
  return urls;
}

async function updateAllRegistros(photoUrls) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/registros?select=id,title&order=event_date`,
    { headers: { ...hdrs, "Content-Type": "application/json" } },
  );
  const registros = await res.json();
  console.log(`  ${registros.length} registros encontrados`);

  for (const reg of registros) {
    const count = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...photoUrls].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    const up = await fetch(
      `${SUPABASE_URL}/rest/v1/registros?id=eq.${reg.id}`,
      {
        method: "PATCH",
        headers: {
          ...hdrs,
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

async function main() {
  console.log("1/2 Upload das imagens reais...");
  const urls = await uploadImages();

  console.log("2/2 Atualizando registros...");
  await updateAllRegistros(urls);

  console.log("\nDone!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
