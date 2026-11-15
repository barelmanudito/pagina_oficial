import { mkdtemp, mkdir, copyFile, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";

// Ejecuta el script real en una copia temporal, sin red ni cambios en los datos públicos.
const root = await mkdtemp(join(tmpdir(), "manudito-calendar-"));
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
  console.log("Calendario: convivencia, imágenes, eliminación, resultados y validación correctos.");
} finally {
  await rm(root, { recursive: true, force: true });
}
