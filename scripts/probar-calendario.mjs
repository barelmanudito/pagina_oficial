import { mkdtemp, mkdir, copyFile, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

// Ejecuta el script real en una copia temporal, sin red ni cambios en los datos públicos.
const root = await mkdtemp(join(tmpdir(), "manudito-calendar-"));
let server;
try {
  await mkdir(join(root, "scripts"));
  await mkdir(join(root, "data"));
  const script = join(root, "scripts/actualizar-partidos.mjs");
  await copyFile(new URL("actualizar-partidos.mjs", import.meta.url), script);
  await writeFile(join(root, "data/configuracion-calendario.json"), '{"cerrar_lunes":false}');
  const date = new Date().toISOString().slice(0, 10);
  const headers = "fecha,nombre,tipo,hora,descripcion,imagen\n";
  const match = `${date},LDA vs Rival,partido,19:00,Primera Division,\n`;
  await writeFile(join(root, "data/calendario.csv"), headers + match);
  await writeFile(join(root, "data/resultados.csv"), "resultados existentes\n");
  const eventFile = join(root, "data/eventos.json");
  const event = { fecha: date, nombre: 'Karaoke, "especial"', tipo: "evento", hora: "20:00", imagen: "assets/eventos/karaoke.webp" };
  const run = () => execFileSync(process.execPath, [script, "--sin-consultar-partidos"], { stdio: "pipe" });
  await writeFile(eventFile, JSON.stringify({ eventos: [event] }));
  run();
  const combined = await readFile(join(root, "data/calendario.csv"), "utf8");
  assert.ok(combined.includes("LDA vs Rival,partido"));
  assert.ok(combined.includes('"Karaoke, ""especial"""'));
  assert.ok(combined.includes(event.imagen));
  assert.equal(await readFile(join(root, "data/resultados.csv"), "utf8"), "resultados existentes\n");
  await writeFile(eventFile, JSON.stringify({ eventos: [] }));
  run();
  assert.ok(!(await readFile(join(root, "data/calendario.csv"), "utf8")).includes("Karaoke"));
  await writeFile(eventFile, JSON.stringify({ eventos: [{ ...event, hora: "29:99" }] }));
  assert.throws(run);
  // Fecha fija: 17/oct a 15/dic, ambos límites inclusive.
  const fixture = (id, date, completed, national = false) => ({
    id, date: `${date}T22:00:00Z`, status: { type: { completed } },
    competitions: [{ competitors: [
      { homeAway: "home", team: { id: national ? "214" : "1", displayName: national ? "Costa Rica" : "Alajuelense" }, score: "2", winner: true },
      { homeAway: "away", team: { id: "2", displayName: "Rival" }, score: "1" },
    ] }],
  });
  const league = [fixture("old", "2026-10-16", true), fixture("edge", "2026-10-17", true), fixture("played", "2026-11-02", true), fixture("future", "2026-11-29", false), fixture("last", "2026-12-15", false), fixture("outside", "2026-12-16", false)];
  const national = [fixture("seleccion", "2026-11-13", true, true), fixture("seleccion-future", "2026-11-18", false, true), fixture("unrelated", "2026-11-15", false)];
  server = createServer((request, response) => {
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ events: request.url.startsWith("/national") ? national : league }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await writeFile(eventFile, '{"eventos":[]}');
  await writeFile(join(root, "data/calendario.csv"), headers);
  await writeFile(join(root, "data/resultados.csv"), "fecha,hora,id_partido\n");
  const execute = promisify(execFile);
  await execute(process.execPath, [script], { env: { ...process.env, CALENDARIO_AHORA: "2026-11-15T18:00:00Z", PARTIDOS_URL: `http://127.0.0.1:${port}/league`, SELECCION_URL: `http://127.0.0.1:${port}/national` } });
  const output = await readFile(join(root, "data/calendario.csv"), "utf8");
  for (const id of ["edge", "played", "future", "last", "seleccion", "seleccion-future"]) assert.ok(output.includes(`,${id},`), id);
  for (const id of ["old", "outside", "unrelated"]) assert.ok(!output.includes(`,${id},`), id);
  const results = await readFile(join(root, "data/resultados.csv"), "utf8");
  assert.ok(results.includes(",played,") && results.includes(",seleccion,"));
  assert.ok(output.includes("Finalizado,2,1"));
  console.log("Calendario: convivencia, imágenes, eliminación, resultados y validación correctos.");
} finally {
  if (server) await new Promise((resolve) => server.close(resolve));
  await rm(root, { recursive: true, force: true });
}
