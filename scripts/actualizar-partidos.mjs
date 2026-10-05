import { readFile, writeFile } from "node:fs/promises";

const CSV_PATH = new URL("../data/calendario.csv", import.meta.url);

function compactDate(date) {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

const rangeStart = new Date();
rangeStart.setUTCHours(0, 0, 0, 0);

const rangeEnd = new Date(rangeStart);
rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 180);

const BASE_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/crc.1/scoreboard";

function monthKey(date) {
  return date.toISOString().slice(0, 7).replace("-", "");
}

function monthsBetween(start, end) {
  const months = [];

  const current = new Date(Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    1
  ));

  while (current <= end) {
    months.push(monthKey(current));
    current.setUTCMonth(current.getUTCMonth() + 1);
  }

  return months;
}

function parseCsv(source) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') { cell += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell.trim()); cell = "";
    } else if (character === "\n" && !quoted) {
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = "";
    } else if (character !== "\r" || quoted) {
      cell += character;
    }
  }
  if (quoted) throw new Error("El CSV tiene comillas sin cerrar");
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function costaRicaParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type)?.value || "";
  return { date: `${value("year")}-${value("month")}-${value("day")}`, time: `${value("hour")}:${value("minute")}` };
}

function teamName(competitor) {
  return competitor?.team?.shortDisplayName
    || competitor?.team?.displayName
    || competitor?.team?.name
    || "Rival por confirmar";
}

const months = monthsBetween(rangeStart, rangeEnd);

const allEvents = [];

for (const month of months) {
  const url = `${BASE_URL}?dates=${month}&limit=500`;

  console.log(`Consultando ESPN: ${month}`);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Bar-El-Manudito-Calendar/1.0"
    },
  });

  if (!response.ok) {
    console.warn(
      `ESPN respondió ${response.status} para ${month}. Se omite ese mes.`
    );
    continue;
  }

  const payload = await response.json();

  if (Array.isArray(payload.events)) {
    allEvents.push(...payload.events);
  }
}

const today = new Date();
today.setUTCHours(0, 0, 0, 0);
const scheduled = allEvents.filter((event) => {
  const date = new Date(event.date);

  return (
    Number.isFinite(date.getTime()) &&
    date >= rangeStart &&
    date <= rangeEnd &&
    !event.status?.type?.completed
  );
});
if (!scheduled.length) throw new Error("La fuente no devolvió partidos futuros; el CSV se conserva sin cambios");

const automaticRows = scheduled.flatMap((event) => {
  const competition = event.competitions?.[0];
  const competitors = competition?.competitors || [];
  const home = competitors.find((competitor) => competitor.homeAway === "home");
  const away = competitors.find((competitor) => competitor.homeAway === "away");
  if (!home || !away) return [];
  const start = new Date(event.date);
  const local = costaRicaParts(start);
  const venue = competition?.venue?.fullName;
  return [{
    fecha: local.date,
    nombre: `${teamName(home)} vs ${teamName(away)}`,
    tipo: "partido",
    hora: local.time,
    descripcion: `Primera División de Costa Rica${venue ? ` · ${venue}` : ""}`,
  }];
});

const current = parseCsv(await readFile(CSV_PATH, "utf8"));
const [headings, ...records] = current;
const expected = ["fecha", "nombre", "tipo", "hora", "descripcion"];
if (!headings || expected.some((heading) => !headings.includes(heading))) {
  throw new Error(`El encabezado debe incluir: ${expected.join(", ")}`);
}
const indexes = Object.fromEntries(expected.map((heading) => [heading, headings.indexOf(heading)]));
const manualRows = records
  .filter((record) => (record[indexes.tipo] || "").toLowerCase() !== "partido")
  .map((record) => Object.fromEntries(expected.map((heading) => [heading, record[indexes[heading]] || ""])));

const uniqueMatches = [...new Map(automaticRows.map((row) => [`${row.fecha}|${row.hora}|${row.nombre}`, row])).values()];
const rows = [...manualRows, ...uniqueMatches].sort((a, b) =>
  a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora) || a.nombre.localeCompare(b.nombre, "es")
);
const output = [expected, ...rows.map((row) => expected.map((heading) => row[heading]))]
  .map((row) => row.map(csvCell).join(","))
  .join("\n") + "\n";

await writeFile(CSV_PATH, output, "utf8");
console.log(`Calendario actualizado: ${uniqueMatches.length} partido(s) de Primera División y ${manualRows.length} fila(s) manual(es).`);
