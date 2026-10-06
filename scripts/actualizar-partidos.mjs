import { readFile, writeFile } from "node:fs/promises";

const CSV_PATH = new URL("../data/calendario.csv", import.meta.url);
const RESULTS_PATH = new URL("../data/resultados.csv", import.meta.url);
const CONFIG_PATH = new URL("../data/configuracion-calendario.json", import.meta.url);
const TIME_ZONE = "America/Costa_Rica";
const DAYS_AHEAD = 180;
const DAYS_BACK = 30;
const API_BASE = process.env.PARTIDOS_URL
  || "https://site.api.espn.com/apis/site/v2/sports/soccer/crc.1/scoreboard";
const headings = [
  "fecha", "nombre", "tipo", "hora", "descripcion", "estadio",
  "id_partido", "id_local", "local", "escudo_local", "id_visitante",
  "visitante", "escudo_visitante", "en_morera", "imagen",
];

function costaRicaParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type)?.value || "";
  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    time: `${value("hour")}:${value("minute")}`,
  };
}

function addDays(dateText, days) {
  const date = new Date(`${dateText}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function monthKeys(start, end) {
  const months = [];
  const cursor = new Date(`${start.slice(0, 7)}-01T12:00:00Z`);
  const last = new Date(`${end.slice(0, 7)}-01T12:00:00Z`);
  while (cursor <= last) {
    months.push(`${cursor.getUTCFullYear()}${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return months;
}

function daysInPeriod(month, start, end) {
  const cursor = new Date(`${month.slice(0, 4)}-${month.slice(4)}-01T12:00:00Z`);
  const days = [];
  while (`${cursor.getUTCFullYear()}${String(cursor.getUTCMonth() + 1).padStart(2, "0")}` === month) {
    const key = cursor.toISOString().slice(0, 10);
    if (key >= start && key <= end) days.push(key.replaceAll("-", ""));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

async function fetchPeriod(period) {
  const response = await fetch(`${API_BASE}?dates=${period}&limit=500`, {
    headers: { Accept: "application/json", "User-Agent": "Bar-El-Manudito-Calendar/2.0" },
  });
  if (!response.ok) throw new Error(`ESPN respondió ${response.status} para ${period}`);
  const payload = await response.json();
  if (!Array.isArray(payload.events)) throw new Error(`ESPN no devolvió eventos para ${period}`);
  return payload.events;
}

async function fetchEvents(start, end) {
  const events = [];
  for (const month of monthKeys(start, end)) {
    try {
      events.push(...await fetchPeriod(month));
    } catch (monthlyError) {
      console.warn(`${monthlyError.message}. Se consultará día por día.`);
      for (const day of daysInPeriod(month, start, end)) {
        try { events.push(...await fetchPeriod(day)); }
        catch (dailyError) { console.warn(dailyError.message); }
      }
    }
  }
  return events;
}

function parseCsv(source) {
  source = source.replace(/^\uFEFF/, "");
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

function teamName(competitor) {
  return competitor?.team?.displayName
    || competitor?.team?.shortDisplayName
    || competitor?.team?.name
    || "Rival por confirmar";
}

function teamLogo(competitor) {
  return competitor?.team?.logo || competitor?.team?.logos?.[0]?.href || "";
}

function isMorera(venue = "") {
  return venue.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes("alejandro morera soto");
}

const start = costaRicaParts(new Date()).date;
const queryStart = addDays(start, -DAYS_BACK);
const end = addDays(start, DAYS_AHEAD);
const payloadEvents = await fetchEvents(queryStart, end);
const eventsById = new Map();

for (const event of payloadEvents) {
  const eventDate = new Date(event.date);
  if (!Number.isFinite(eventDate.getTime())) continue;
  const localDate = costaRicaParts(eventDate).date;
  if (localDate < queryStart || localDate > end) continue;
  eventsById.set(String(event.id || `${event.date}|${event.name}`), event);
}

const automaticRows = [...eventsById.values()].flatMap((event) => {
  if (event.status?.type?.completed) return [];
  const competition = event.competitions?.[0];
  const competitors = competition?.competitors || [];
  const home = competitors.find((competitor) => competitor.homeAway === "home");
  const away = competitors.find((competitor) => competitor.homeAway === "away");
  if (!home || !away) return [];
  const localTime = costaRicaParts(new Date(event.date));
  if (localTime.date < start || localTime.date > end) return [];
  const venue = competition?.venue?.fullName || "";
  const homeName = teamName(home);
  const awayName = teamName(away);
  return [{
    fecha: localTime.date,
    nombre: `${homeName} vs ${awayName}`,
    tipo: "partido",
    hora: localTime.time,
    descripcion: "Primera División de Costa Rica",
    estadio: venue,
    id_partido: event.id || "",
    id_local: home.team?.id || "",
    local: homeName,
    escudo_local: teamLogo(home),
    id_visitante: away.team?.id || "",
    visitante: awayName,
    escudo_visitante: teamLogo(away),
    en_morera: isMorera(venue) ? "si" : "no",
    imagen: "",
  }];
});

const resultHeadings = [
  "fecha", "hora", "id_partido", "id_local", "local", "escudo_local",
  "marcador_local", "id_visitante", "visitante", "escudo_visitante",
  "marcador_visitante", "ganador", "estadio", "en_morera", "estado",
];

const resultRows = [...eventsById.values()].flatMap((event) => {
  if (!event.status?.type?.completed) return [];
  const competition = event.competitions?.[0];
  const competitors = competition?.competitors || [];
  const home = competitors.find((competitor) => competitor.homeAway === "home");
  const away = competitors.find((competitor) => competitor.homeAway === "away");
  if (!home || !away) return [];
  const localTime = costaRicaParts(new Date(event.date));
  if (localTime.date < queryStart || localTime.date > start) return [];
  const venue = competition?.venue?.fullName || "";
  const homeName = teamName(home);
  const awayName = teamName(away);
  const winner = home.winner ? homeName : away.winner ? awayName : "Empate";
  return [{
    fecha: localTime.date,
    hora: localTime.time,
    id_partido: event.id || "",
    id_local: home.team?.id || "",
    local: homeName,
    escudo_local: teamLogo(home),
    marcador_local: home.score ?? "",
    id_visitante: away.team?.id || "",
    visitante: awayName,
    escudo_visitante: teamLogo(away),
    marcador_visitante: away.score ?? "",
    ganador: winner,
    estadio: venue,
    en_morera: isMorera(venue) ? "si" : "no",
    estado: event.status?.type?.detail || event.status?.type?.description || "Finalizado",
  }];
}).sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));

const current = parseCsv(await readFile(CSV_PATH, "utf8"));
const [currentHeadings, ...records] = current;
const required = ["fecha", "nombre", "tipo", "hora", "descripcion"];
if (!currentHeadings || required.some((heading) => !currentHeadings.includes(heading))) {
  throw new Error(`El encabezado debe incluir: ${required.join(", ")}`);
}
const indexes = Object.fromEntries(headings.map((heading) => [heading, currentHeadings.indexOf(heading)]));
const manualRows = records
  .filter((record) => (record[indexes.tipo] || "").toLowerCase() !== "partido")
  .map((record) => Object.fromEntries(headings.map((heading) => [heading, indexes[heading] >= 0 ? record[indexes[heading]] || "" : ""])));

let calendarConfig = { cerrar_lunes: true, imagen_cerrado: "assets/cerrado.svg" };
try {
  calendarConfig = { ...calendarConfig, ...JSON.parse(await readFile(CONFIG_PATH, "utf8")) };
} catch (error) {
  console.warn("No se encontró configuración del calendario; se usarán los valores predeterminados.");
}

const occupiedDates = new Set([
  ...manualRows.map((row) => row.fecha),
  ...automaticRows.map((row) => row.fecha),
]);
const mondayRows = [];
if (calendarConfig.cerrar_lunes) {
  let cursor = start;
  while (cursor <= end) {
    if (new Date(`${cursor}T12:00:00Z`).getUTCDay() === 1 && !occupiedDates.has(cursor)) {
      mondayRows.push({
        fecha: cursor,
        nombre: "Cerrado",
        tipo: "cerrado",
        hora: "",
        descripcion: "El bar permanece cerrado los lunes.",
        estadio: "",
        id_partido: "",
        id_local: "",
        local: "",
        escudo_local: "",
        id_visitante: "",
        visitante: "",
        escudo_visitante: "",
        en_morera: "no",
        imagen: calendarConfig.imagen_cerrado || "assets/cerrado.svg",
      });
    }
    cursor = addDays(cursor, 1);
  }
}

const rows = [...manualRows, ...mondayRows, ...automaticRows].sort((a, b) =>
  a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora) || a.nombre.localeCompare(b.nombre, "es")
);
const output = [headings, ...rows.map((row) => headings.map((heading) => row[heading]))]
  .map((row) => row.map(csvCell).join(","))
  .join("\n") + "\n";

await writeFile(CSV_PATH, output, "utf8");
const resultsOutput = [resultHeadings, ...resultRows.map((row) => resultHeadings.map((heading) => row[heading]))]
  .map((row) => row.map(csvCell).join(","))
  .join("\n") + "\n";
await writeFile(RESULTS_PATH, resultsOutput, "utf8");

console.log(
  `Calendario actualizado: ${automaticRows.length} partido(s) futuros, `
  + `${resultRows.length} resultado(s), ${manualRows.length} evento(s) manual(es) `
  + `y ${mondayRows.length} lunes cerrado(s).`,
);
