import { readFile, writeFile } from "node:fs/promises";

const CSV_PATH = new URL("../data/calendario.csv", import.meta.url);
const RESULTS_PATH = new URL("../data/resultados.csv", import.meta.url);
const CONFIG_PATH = new URL("../data/configuracion-calendario.json", import.meta.url);
const TIME_ZONE = "America/Costa_Rica";
const API_BASE = process.env.PARTIDOS_URL
  || "https://site.api.espn.com/apis/site/v2/sports/soccer/crc.1/scoreboard";
const NATIONAL_BASE = process.env.SELECCION_URL
  || "https://site.api.espn.com/apis/site/v2/sports/soccer/all/teams/214/schedule";
const successfulMonths = new Set();
let nationalSuccessful = false;
const headings = [
  "fecha", "nombre", "tipo", "hora", "descripcion", "estadio",
  "id_partido", "id_local", "local", "escudo_local", "id_visitante",
  "visitante", "escudo_visitante", "en_morera", "imagen", "estado", "marcador_local", "marcador_visitante",
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
    signal: AbortSignal.timeout(25000),
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
      successfulMonths.add(month);
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

async function fetchNational(start, end) {
  const events = [];
  let successful = true;
  for (let year = Number(start.slice(0, 4)); year <= Number(end.slice(0, 4)); year += 1) {
    // ESPN separates played matches from fixtures in some team schedules.
    for (const fixture of [false, true]) {
      try {
        const response = await fetch(`${NATIONAL_BASE}?season=${year}&fixture=${fixture}`, { signal: AbortSignal.timeout(25000) });
        if (!response.ok) throw new Error(`Selección: ESPN respondió ${response.status}`);
        const payload = await response.json();
        if (!Array.isArray(payload.events)) throw new Error("Selección: respuesta sin calendario");
        events.push(...payload.events.filter((event) =>
          event.competitions?.[0]?.competitors?.some((team) => String(team.team?.id) === "214")
        ).map((event) => ({ ...event, seleccion: true })));
      } catch (error) {
        successful = false;
        console.warn(error.message);
      }
    }
  }
  nationalSuccessful = successful;
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

const start = costaRicaParts(new Date(process.env.CALENDARIO_AHORA || Date.now())).date;
const monthStart = `${start.slice(0, 7)}-01`;
const nextMonth = new Date(`${monthStart}T12:00:00Z`);
nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
const queryStart = addDays(monthStart, -15);
const end = addDays(nextMonth.toISOString().slice(0, 10), 14);
const offline = process.argv.includes("--sin-consultar-partidos");
const payloadEvents = offline ? [] : [...await fetchEvents(queryStart, end), ...await fetchNational(queryStart, end)];
const eventsById = new Map();

for (const event of payloadEvents) {
  const eventDate = new Date(event.date);
  if (!Number.isFinite(eventDate.getTime())) continue;
  const localDate = costaRicaParts(eventDate).date;
  if (localDate < queryStart || localDate > end) continue;
  eventsById.set(String(event.id || `${event.date}|${event.name}`), event);
}

let automaticRows = [...eventsById.values()].flatMap((event) => {
  const competition = event.competitions?.[0];
  const competitors = competition?.competitors || [];
  const home = competitors.find((competitor) => competitor.homeAway === "home");
  const away = competitors.find((competitor) => competitor.homeAway === "away");
  if (!home || !away) return [];
  const localTime = costaRicaParts(new Date(event.date));
  if (localTime.date < queryStart || localTime.date > end) return [];
  const status = event.status?.type || competition.status?.type || {};
  const venue = competition?.venue?.fullName || "";
  const homeName = teamName(home);
  const awayName = teamName(away);
  return [{
    fecha: localTime.date,
    nombre: `${homeName} vs ${awayName}`,
    tipo: "partido",
    hora: localTime.time,
    descripcion: event.seleccion ? "Selección de Costa Rica" : "Primera División de Costa Rica",
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
    estado: status.completed ? "Finalizado" : status.state === "in" ? "En juego" : status.name === "STATUS_POSTPONED" ? "Pospuesto" : status.name === "STATUS_CANCELED" ? "Cancelado" : "Programado",
    marcador_local: status.completed ? home.score?.displayValue ?? home.score ?? "" : "",
    marcador_visitante: status.completed ? away.score?.displayValue ?? away.score ?? "" : "",
  }];
});

const resultHeadings = [
  "fecha", "hora", "id_partido", "id_local", "local", "escudo_local",
  "marcador_local", "id_visitante", "visitante", "escudo_visitante",
  "marcador_visitante", "ganador", "estadio", "en_morera", "estado",
];

let resultRows = [...eventsById.values()].flatMap((event) => {
  const status = event.status?.type || event.competitions?.[0]?.status?.type || {};
  if (!status.completed) return [];
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
    marcador_local: home.score?.displayValue ?? home.score ?? "",
    id_visitante: away.team?.id || "",
    visitante: awayName,
    escudo_visitante: teamLogo(away),
    marcador_visitante: away.score?.displayValue ?? away.score ?? "",
    ganador: winner,
    estadio: venue,
    en_morera: isMorera(venue) ? "si" : "no",
    estado: status.detail || status.description || "Finalizado",
  }];
}).sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));

const current = parseCsv(await readFile(CSV_PATH, "utf8"));
const [currentHeadings, ...records] = current;
const required = ["fecha", "nombre", "tipo", "hora", "descripcion"];
if (!currentHeadings || required.some((heading) => !currentHeadings.includes(heading))) {
  throw new Error(`El encabezado debe incluir: ${required.join(", ")}`);
}
const indexes = Object.fromEntries(headings.map((heading) => [heading, currentHeadings.indexOf(heading)]));
// Los eventos manuales tienen una única fuente; borrar en el editor los elimina.
const { eventos: manualRows } = JSON.parse(await readFile(new URL("../data/eventos.json", import.meta.url), "utf8"));
for (const row of manualRows) {
  if (!["evento", "cerrado"].includes(row.tipo) || !row.nombre?.trim()
      || !/^\d{4}-\d{2}-\d{2}$/.test(row.fecha)
      || Number.isNaN(Date.parse(`${row.fecha}T12:00:00Z`))
      || new Date(`${row.fecha}T12:00:00Z`).toISOString().slice(0, 10) !== row.fecha
      || (row.hora && !/^([01]\d|2[0-3]):[0-5]\d$/.test(row.hora))) {
    throw new Error("Evento manual inválido: revisá nombre, tipo, fecha y hora en el panel.");
  }
}
// En publicaciones de contenido no dependemos de ESPN; conservamos los partidos.
const savedMatches = records.filter((record) => record[indexes.tipo] === "partido")
  .map((record) => Object.fromEntries(headings.map((heading) => [heading, record[indexes[heading]] || ""])))
  .filter((row) => row.fecha >= queryStart && row.fecha <= end);
const isNational = (row) => row.id_local === "214" || row.id_visitante === "214" || row.descripcion?.includes("Selección");
const keepSaved = (row) => offline || row.fecha <= start || (isNational(row)
  ? !nationalSuccessful : !successfulMonths.has(row.fecha.slice(0, 7).replace("-", "")));
const key = (row) => row.id_partido || `${row.fecha}|${row.nombre}`;
automaticRows = [...new Map([...savedMatches.filter(keepSaved), ...automaticRows].map((row) => [key(row), row])).values()];
try {
  const [columns, ...oldResults] = parseCsv(await readFile(RESULTS_PATH, "utf8"));
  const saved = oldResults.map((record) => Object.fromEntries(columns.map((name, i) => [name, record[i] || ""])))
    .filter((row) => row.fecha >= queryStart && row.fecha <= end);
  resultRows = [...new Map([...saved, ...resultRows].map((row) => [row.id_partido || `${row.fecha}|${row.local}|${row.visitante}`, row])).values()]
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

let calendarConfig = { cerrar_lunes: true, imagen_cerrado: "assets/cerrado.svg" };
try {
  calendarConfig = { ...calendarConfig, ...JSON.parse(await readFile(CONFIG_PATH, "utf8")) };
} catch (error) {
  console.warn("No se encontró configuración del calendario; se usarán los valores predeterminados.");
}

// Un lunes solo deja de marcarse como cerrado cuando existe una actividad
// publicada en el panel de eventos. Un partido automático no abre el bar.
const occupiedDates = new Set(manualRows.map((row) => row.fecha));
const mondayRows = [];
if (calendarConfig.cerrar_lunes) {
  let cursor = queryStart;
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
  a.fecha.localeCompare(b.fecha) || (a.hora || "").localeCompare(b.hora || "") || a.nombre.localeCompare(b.nombre, "es")
);
const output = [headings, ...rows.map((row) => headings.map((heading) => row[heading]))]
  .map((row) => row.map(csvCell).join(","))
  .join("\n") + "\n";

await writeFile(CSV_PATH, output, "utf8");
const resultsOutput = [resultHeadings, ...resultRows.map((row) => resultHeadings.map((heading) => row[heading]))]
  .map((row) => row.map(csvCell).join(","))
  .join("\n") + "\n";
if (!offline) await writeFile(RESULTS_PATH, resultsOutput, "utf8");

console.log(
  `Calendario actualizado (${queryStart} a ${end}): ${automaticRows.length} partido(s), `
  + `${resultRows.length} resultado(s), ${manualRows.length} evento(s) manual(es) `
  + `y ${mondayRows.length} lunes cerrado(s).`,
);
