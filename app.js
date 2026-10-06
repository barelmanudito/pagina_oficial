// Productos y precios transcritos de la carta del bar facilitada por el propietario.
// La promoción de alitas con Tropical se excluye por solicitud expresa.
const menuGroups = [
  {
    category: "bocas", label: "Bocas", items: [
      ["ceviche", "Ceviche", 3400],
      ["chifrijo", "Chifrijo", 4400],
      ["frijoles-tiernos", "Frijoles tiernos", 3400],
      ["gallo-chorizo", "Gallo de chorizo", 3200],
      ["gallo-pescado", "Gallo de pescado", 3400],
      ["gallo-salchichon", "Gallo de salchichón", 3200],
      ["garbanzos-pollo", "Garbanzos con pollo", 3500],
      ["jalapenos-poppers", "Jalapeños poppers", 3700],
      ["mini-taquitos", "Mini taquitos", 2700],
      ["palitos-queso", "Palitos de queso", 3500],
      ["taco-grande", "Taco grande", 3200],
      ["yuca", "Yuca", 3200],
    ],
  },
  {
    category: "fuertes", label: "Arroces", items: [
      ["arroz-pollo", "Arroz con pollo", 4200],
      ["arroz-camarones", "Arroz con camarones", 5000],
      ["arroz-ranchero", "Arroz ranchero", 5000],
    ],
  },
  {
    category: "fuertes", label: "Carnes", items: [
      ["bistec-encebollado", "Bistec encebollado", 4700],
      ["costilla", "Costilla", 4900],
      ["fajitas-res-jalapena", "Fajitas de res a la jalapeña", 5000],
      ["fajitas-mixtas", "Fajitas mixtas", 5000],
      ["lomo-suizo", "Lomo suizo", 5200],
      ["mexicana", "Mexicana", 4700],
      ["sopa-carne", "Sopa de carne", 3500],
    ],
  },
  {
    category: "fuertes", label: "Pollo", items: [
      ["alitas-papas", "Alitas con papas", 4700],
      ["dedos-pollo", "Dedos de pollo empanizado", 5000],
      ["fajitas-pollo", "Fajitas de pollo", 4800],
      ["pechuga-plancha", "Pechuga a la plancha", 5000],
      ["pechuga-gratinada", "Pechuga gratinada", 5200],
      ["sopa-pollo", "Sopa de pollo", 3500],
    ],
  },
  {
    category: "fuertes", label: "Pescado", items: [
      ["camarones-empanizados", "Camarones empanizados", 5000],
      ["dedos-pescado", "Dedos de pescado empanizado", 5000],
      ["filete-plancha", "Filete de pescado a la plancha", 4700],
      ["filete-empanizado", "Filete de pescado empanizado", 4700],
    ],
  },
  {
    category: "especialidades", label: "Especialidades", items: [
      ["tacos-birria", "Tacos de birria", 6000],
      ["chile-relleno", "Chile relleno", 3800],
      ["papas-bravas", "Papas bravas", 4000],
      ["gallo-giba", "Gallo de giba", 5000],
      ["gallo-morcilla", "Gallo de morcilla", 3500],
      ["nachos", "Nachos", 5500],
      ["new-york-steak", "New York Steak (350 g)", 9000],
      ["rib-eye", "Rib Eye (350 g)", 9000],
      ["churrasco", "Churrasco", 8000],
      ["entrana", "Entraña", 8000],
      ["pata-salsa", "Pata en salsa", 3200],
      ["pataconten", "Pataconten", 5500],
      ["salchipapas", "Salchipapas", 4000],
      ["sopa-azteca", "Sopa azteca", 3500],
      ["sopa-negra", "Sopa negra con huevo", 3500],
    ],
  },
  {
    category: "cervezas", label: "Cervezas nacionales", items: [
      ["imperial", "Imperial", 1500, "Original, Silver, Light, Ultra o Cero · 350 ml"],
      ["pilsen", "Pilsen", 1500, "Original o 6.0 · 350 ml"],
    ],
  },
  {
    category: "cervezas", label: "Cervezas prémium", items: [
      ["bavaria", "Bavaria", 1600, "Master, Gold o Light · 355 ml"],
      ["heineken", "Heineken", 1600, "Original o Cero · 355 ml"],
      ["sol", "Sol", 1600, "350 ml"],
    ],
  },
  {
    category: "cocteles", label: "Cócteles y tragos", items: [
      ["smirnoff", "Smirnoff", 1800, "Guaraná, Black, Green o Red · 350 ml"],
      ["adan-eva", "Adán y Eva", 1600, "Frutos rojos, maracuyá piña, Gin & Tonic, Moscow Mule u Orange Spritz"],
      ["copa-sangria", "Copa de sangría", 4000],
      ["gin-tonic", "Gin Tonic", 4000],
    ],
  },
  {
    category: "sin-alcohol", label: "Refrescos", items: [
      ["pepsi-350", "Pepsi 350 ml", 1500, "Original o Zero"],
      ["pepsi-600", "Pepsi 600 ml", 1500, "Original o Zero"],
      ["evervess", "Evervess", 1500, "Gin, soda o agua mineral · 350 ml"],
      ["tropical-355", "Tropical 355 ml", 1500, "Blanco arándanos, frutas melocotón o blanco frutas tropicales"],
      ["tropical-500", "Tropical 500 ml", 1500, "Blanco arándanos, limón, melocotón o blanco frutas tropicales"],
      ["maxxx-energy", "Maxxx Energy", 2200, "Guaraná · 350 ml"],
      ["agua-cristal", "Agua Cristal", 1000, "600 ml"],
      ["vitaloe", "Vitaloe", 2000],
      ["otras-bebidas", "Otras bebidas", 1500, "Coca Cola, soda o Gin"],
    ],
  },
  {
    category: "combos", label: "Combos", items: [
      ["chifrijo-pepsi", "Chifrijo + Pepsi", 5700],
      ["baldazo-cervecero", "Baldazo cervecero", 7500, "6 cervezas por el precio de 5"],
    ],
  },
];

const placeholderPhoto = "assets/productos/imagen-pendiente.svg";
const menuItems = menuGroups.flatMap(({ category, label, items }) =>
  items.map(([id, name, price, description = ""]) => ({
    id, name, price, description, category, categoryLabel: label,
    photo: menuPhotos[id] || placeholderPhoto,
  }))
);

const menuGrid = document.querySelector("#menu-grid");
const menuTabs = [...document.querySelectorAll(".menu-tab")];
let menuCards = [];
const order = new Map();
const money = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  maximumFractionDigits: 0,
});

menuGrid?.addEventListener("error", (event) => {
  const photo = event.target.closest?.(".menu-item-photo");
  if (!photo || photo.getAttribute("src") === placeholderPhoto) return;
  const card = photo.closest(".menu-item");
  const name = card?.querySelector("h3")?.textContent || "este producto";
  photo.src = placeholderPhoto;
  photo.alt = `Imagen pendiente para ${name}`;
  photo.classList.add("is-placeholder");
  card?.querySelector(".menu-item-media")?.classList.add("is-placeholder");
}, true);

function updateJar(card, item) {
  if (card.dataset.itemId === item.id) return;
  card.dataset.itemId = item.id;
  card.querySelector(".menu-item-category").textContent = item.categoryLabel;
  card.querySelector("h3").textContent = item.name;
  const photo = card.querySelector(".menu-item-photo");
  const usesPlaceholder = item.photo === placeholderPhoto;
  card.querySelector(".menu-item-media").classList.toggle("is-placeholder", usesPlaceholder);
  photo.classList.toggle("is-placeholder", usesPlaceholder);
  if (photo.getAttribute("src") !== item.photo) photo.src = item.photo;
  photo.alt = usesPlaceholder ? `Imagen pendiente para ${item.name}` : `Foto de ${item.name}`;
  const description = card.querySelector(".menu-item-description");
  description.textContent = item.description;
  description.hidden = !item.description;
  card.querySelector(".menu-item-price").textContent = money.format(item.price);
  const button = card.querySelector(".add-item");
  button.dataset.add = item.id;
  button.setAttribute("aria-label", `Agregar ${item.name} a mi selección`);
  button.textContent = "+";
}

function renderMenu(category = "todos") {
  if (!menuCards.length) {
    const lightweightMobileMenu = document.body.classList.contains("menu-only-page") &&
      window.matchMedia("(max-width: 720px)").matches;
    const bubbleMarkup = lightweightMobileMenu ? "" : "<span></span>".repeat(14);
    menuGrid.innerHTML = menuItems
      .map((item) => `
      <article class="menu-item" data-item-id="${item.id}">
        <div class="beer" aria-hidden="true">
          <div class="beer-bubbles">${bubbleMarkup}</div>
        </div>
        <video class="mobile-beer-animation" data-src="assets/beer-mobile.webm" muted loop playsinline
          preload="none" aria-hidden="true" width="180" height="296"></video>
        <canvas class="frost" aria-hidden="true"></canvas>
        <div class="drops" aria-hidden="true"></div>
        <div class="beer-menu-content">
          <span class="menu-item-category">${item.categoryLabel}</span>
          <h3>${item.name}</h3>
          <div class="menu-item-media${item.photo === placeholderPhoto ? " is-placeholder" : ""}">
            <img class="menu-item-photo${item.photo === placeholderPhoto ? " is-placeholder" : ""}"
              src="${item.photo}" alt="${item.photo === placeholderPhoto ? `Imagen pendiente para ${item.name}` : `Foto de ${item.name}`}"
              loading="lazy" decoding="async" />
          </div>
          <p class="menu-item-description"${item.description ? "" : " hidden"}>${item.description}</p>
          <div class="menu-item-footer">
            <span class="menu-item-price">${money.format(item.price)}</span>
            <button class="add-item" type="button" data-add="${item.id}" aria-label="Agregar ${item.name} a mi selección">+</button>
          </div>
        </div>
        <img class="beer-foam" src="assets/beer-foam.svg" alt="" aria-hidden="true" width="260" height="122" loading="lazy" />
      </article>
    `)
      .join("");

    menuCards = [...menuGrid.querySelectorAll(".menu-item")];
    window.setupFrostedMenu?.(menuGrid);
  }

  // Reuse each position's glass, frost canvas and droplets; only the product changes.
  const visibleItems = category === "todos" ? menuItems : menuItems.filter((item) => item.category === category);
  menuCards.forEach((card, index) => {
    const item = visibleItems[index];
    if (item) updateJar(card, item);
    card.hidden = !item;
  });
  // Prepare the frost on newly visible glasses before the next paint.
  window.refreshFrostedMenu?.(menuGrid);
  for (const tab of menuTabs) {
    const active = tab.dataset.category === category;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-pressed", String(active));
  }
}

menuTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    renderMenu(tab.dataset.category);
  });
});

// En la página principal para computadora se muestran primero las cervezas.
// La carta independiente y la versión móvil conservan la vista completa.
const defaultMenuCategory = !document.body.classList.contains("menu-only-page")
  && window.matchMedia("(min-width: 721px)").matches
  ? "cervezas"
  : "todos";
renderMenu(defaultMenuCategory);

menuGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const id = button.dataset.add;
  order.set(id, (order.get(id) || 0) + 1);
  updateOrderSummary();
  button.textContent = "✓";
  window.setTimeout(() => { button.textContent = "+"; }, 650);
});

const orderDialog = document.querySelector("#order-dialog");
const orderList = document.querySelector("#order-list");
const orderTotal = document.querySelector("#order-total");
const copyOrderButton = document.querySelector("#copy-order");
const copyStatus = document.querySelector("#copy-status");
const floatingOrder = document.querySelector("#floating-order");

function selectedCount() {
  return [...order.values()].reduce((sum, quantity) => sum + quantity, 0);
}

function updateOrderSummary() {
  const count = selectedCount();
  document.querySelector("#selection-count").textContent = count;
  document.querySelector("#floating-count").textContent = count;
  floatingOrder.hidden = count === 0;
  renderOrder();
}

function renderOrder() {
  const rows = [...order.entries()]
    .map(([id, quantity]) => ({
      item: menuItems.find((menuItem) => menuItem.id === id),
      quantity,
    }))
    .filter(({ item }) => item);

  if (!rows.length) {
    orderList.innerHTML = '<p class="order-empty">Todavía no agregaste productos. Explorá el menú y armá tu selección.</p>';
    orderTotal.textContent = money.format(0);
    copyOrderButton.disabled = true;
    return;
  }

  orderList.innerHTML = rows
    .map(({ item, quantity }) => `
      <div class="order-row">
        <strong>${item.name}</strong>
        <p>${money.format(item.price * quantity)}</p>
        <div class="quantity-controls" aria-label="Cantidad de ${item.name}">
          <button type="button" data-change="${item.id}" data-delta="-1" aria-label="Quitar uno">−</button>
          <span>${quantity}</span>
          <button type="button" data-change="${item.id}" data-delta="1" aria-label="Agregar uno">+</button>
        </div>
      </div>
    `)
    .join("");

  const total = rows.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);
  orderTotal.textContent = money.format(total);
  copyOrderButton.disabled = false;
}

function openOrder() {
  renderOrder();
  copyStatus.textContent = "";
  orderDialog.showModal();
}

document.querySelector("#open-order").addEventListener("click", openOrder);
floatingOrder.addEventListener("click", openOrder);
document.querySelector("#close-order").addEventListener("click", () => orderDialog.close());
orderDialog.addEventListener("click", (event) => {
  if (event.target === orderDialog) orderDialog.close();
});

orderList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-change]");
  if (!button) return;
  const id = button.dataset.change;
  const nextQuantity = (order.get(id) || 0) + Number(button.dataset.delta);
  if (nextQuantity <= 0) order.delete(id);
  else order.set(id, nextQuantity);
  updateOrderSummary();
});

async function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

copyOrderButton.addEventListener("click", async () => {
  const rows = [...order.entries()]
    .map(([id, quantity]) => ({ item: menuItems.find((entry) => entry.id === id), quantity }))
    .filter(({ item }) => item);
  const total = rows.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);
  const text = [
    "Mi selección — Bar El Manudito",
    ...rows.map(({ item, quantity }) => `${quantity} × ${item.name} — ${money.format(item.price * quantity)}`),
    `Total estimado: ${money.format(total)}`,
  ].join("\n");

  try {
    await copyText(text);
    copyStatus.textContent = "Selección copiada. Ya podés compartirla.";
  } catch {
    copyStatus.textContent = "No se pudo copiar automáticamente. Intentá nuevamente.";
  }
});

const monthNames = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const today = new Date();
let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const calendarTitle = document.querySelector("#calendar-title");
const calendarGrid = document.querySelector("#calendar-grid");
const eventTag = document.querySelector("#event-tag");
const eventDetail = document.querySelector("#event-detail");
const eventDate = document.querySelector("#event-date");
const eventName = document.querySelector("#event-name");
const eventVisual = document.querySelector("#event-visual");
const eventDescription = document.querySelector("#event-description");
const eventMeta = document.querySelector("#event-meta");
let calendarEvents = new Map();

// Lee CSV estándar: comas, campos entre comillas y textos con saltos de línea.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");
  const firstLine = source.split(/\r?\n/, 1)[0];
  const delimiter = firstLine.includes(";") && !firstLine.includes(",") ? ";" : ",";

  for (let i = 0; i < source.length; i += 1) {
    const character = source[i];
    if (character === '"') {
      if (quoted && source[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      row.push(cell.trim()); cell = "";
    } else if (character === "\n" && !quoted) {
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = "";
    } else if (character !== "\r" || quoted) {
      cell += character;
    }
  }
  if (quoted) throw new Error("Comillas sin cerrar en calendario.csv");
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function readCalendar(text) {
  const [headings, ...records] = parseCsv(text);
  const required = ["fecha", "nombre", "tipo"];
  const optional = [
    "hora", "descripcion", "estadio", "id_partido", "id_local", "local",
    "escudo_local", "id_visitante", "visitante", "escudo_visitante",
    "en_morera", "imagen",
  ];
  if (!headings || required.some((heading) => !headings.map((value) => value.toLowerCase()).includes(heading))) {
    throw new Error("Faltan columnas en calendario.csv");
  }
  const columns = Object.fromEntries([...required, ...optional].map((heading) => [heading, headings.findIndex((value) => value.toLowerCase() === heading)]));
  const events = new Map();

  for (const record of records) {
    const value = (name) => (record[columns[name]] || "").trim();
    const key = value("fecha");
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
    if (!match) continue;
    const [year, month, day] = match.slice(1).map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) continue;
    const type = value("tipo").toLowerCase();
    if (!["evento", "partido", "cerrado"].includes(type)) continue;
    const title = value("nombre") || (type === "cerrado" ? "Día sin servicio" : "");
    if (!title) continue;
    const venue = value("estadio");
    const moreraValue = value("en_morera").toLowerCase();
    const entry = {
      title,
      type,
      time: value("hora"),
      description: value("descripcion"),
      venue,
      matchId: value("id_partido"),
      homeId: value("id_local"),
      home: value("local"),
      homeLogo: value("escudo_local"),
      awayId: value("id_visitante"),
      away: value("visitante"),
      awayLogo: value("escudo_visitante"),
      isMorera: ["si", "sí", "true", "1"].includes(moreraValue)
        || venue.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes("alejandro morera soto"),
      image: value("imagen"),
    };
    const current = events.get(key) || [];
    if (type === "cerrado") events.set(key, [entry]);
    else if (!current.some((item) => item.type === "cerrado")) events.set(key, [...current, entry]);
  }
  return events;
}

function defaultMondayClosure() {
  return {
    title: "Cerrado",
    type: "cerrado",
    time: "",
    description: "El bar permanece cerrado los lunes, salvo cuando se programe una actividad especial.",
    venue: "",
    matchId: "",
    homeId: "",
    home: "",
    homeLogo: "",
    awayId: "",
    away: "",
    awayLogo: "",
    isMorera: false,
    image: "",
  };
}

function calendarEventsForKey(key) {
  const scheduled = calendarEvents.get(key) || [];
  const date = new Date(`${key}T12:00:00`);
  const isMonday = Number.isFinite(date.getTime()) && date.getDay() === 1;

  if (!isMonday) return scheduled;

  // Un evento escrito manualmente en calendario.csv abre el bar ese lunes.
  // Un partido agregado automáticamente no modifica por sí solo el cierre semanal.
  if (scheduled.some((event) => event.type === "evento")) return scheduled;

  const explicitClosure = scheduled.find((event) => event.type === "cerrado");
  return [explicitClosure || defaultMondayClosure()];
}

function calendarMessage(title, message) {
  eventDetail.classList.remove("is-closed", "is-match", "is-home-match");
  eventTag.textContent = "AGENDA DEL BAR";
  eventDate.textContent = "Seleccioná una fecha marcada";
  eventName.textContent = title;
  eventVisual.replaceChildren();
  eventVisual.hidden = true;
  eventDescription.textContent = message;
  eventMeta.textContent = "";
}

async function loadCalendar() {
  try {
    const response = await fetch("data/calendario.csv", { cache: "no-store" });
    if (!response.ok) throw new Error(`Error ${response.status}`);
    calendarEvents = readCalendar(await response.text());
    renderCalendar();
    if (!calendarEvents.size) calendarMessage("Próximas actividades", "Todavía no hay eventos ni cierres confirmados.");
  } catch (error) {
    calendarMessage("Agenda no disponible", "No se pudo leer el archivo de calendario. Revisá calendario.csv o abrí la página desde un servidor local.");
    console.warn("Calendario no disponible:", error);
  }
}

function eventImageSource(event) {
  if (event.image) return event.image;
  if (event.type === "cerrado") return "assets/cerrado.svg";
  return "";
}

function createEventImage(event, compact = false) {
  const source = eventImageSource(event);
  if (!source) return null;
  const image = document.createElement("img");
  image.className = compact ? "event-promo-image is-compact" : "event-promo-image";
  image.src = source;
  image.alt = event.type === "cerrado" ? "Bar cerrado" : `Promoción: ${event.title}`;
  image.loading = "lazy";
  image.addEventListener("error", () => image.remove(), { once: true });
  return image;
}

function createTeamLogo(source, name, compact = false) {
  const frame = document.createElement("span");
  frame.className = compact ? "team-logo-frame is-compact" : "team-logo-frame";
  if (source) {
    const image = document.createElement("img");
    image.src = source;
    image.alt = `Escudo de ${name || "equipo"}`;
    image.loading = "lazy";
    image.addEventListener("error", () => frame.classList.add("has-error"), { once: true });
    frame.append(image);
  }
  const fallback = document.createElement("span");
  fallback.className = "team-logo-fallback";
  fallback.textContent = (name || "?").split(/\s+/).map((word) => word[0]).join("").slice(0, 3).toUpperCase();
  frame.append(fallback);
  return frame;
}

function createMatchVisual(event, compact = false) {
  if (!event.home && !event.away && !event.homeLogo && !event.awayLogo) return null;
  const visual = document.createElement("div");
  visual.className = compact ? "match-visual is-compact" : "match-visual";

  const team = (name, logo) => {
    const block = document.createElement("div");
    block.className = "match-team";
    block.append(createTeamLogo(logo, name, compact));
    const label = document.createElement("span");
    label.textContent = name || "Por confirmar";
    block.append(label);
    return block;
  };

  const versus = document.createElement("strong");
  versus.className = "match-versus";
  versus.textContent = "VS";
  visual.append(team(event.home, event.homeLogo), versus, team(event.away, event.awayLogo));
  return visual;
}

function renderEventVisual(event) {
  eventVisual.replaceChildren();
  const visual = event.type === "partido" ? createMatchVisual(event) : createEventImage(event);
  if (visual) eventVisual.append(visual);
  if (event.isMorera) {
    const badge = document.createElement("span");
    badge.className = "morera-badge";
    badge.textContent = "EN EL ALEJANDRO MORERA SOTO";
    eventVisual.append(badge);
  }
  eventVisual.hidden = !eventVisual.childElementCount;
}

function eventMetaText(event) {
  const parts = [];
  if (event.time) parts.push(event.time);
  else parts.push(event.type === "cerrado" ? "Sin servicio" : "Horario por confirmar");
  if (event.venue) parts.push(event.venue);
  return parts.join(" · ");
}

function showEvent(key, dayButton) {
  const events = calendarEventsForKey(key);
  if (!events?.length) return;
  document.querySelectorAll(".calendar-day").forEach((day) => day.classList.remove("is-selected"));
  dayButton.classList.add("is-selected");
  const date = new Date(`${key}T12:00:00`);
  eventDate.textContent = new Intl.DateTimeFormat("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  if (events.length === 1) {
    const event = events[0];
    eventDetail.classList.toggle("is-closed", event.type === "cerrado");
    eventDetail.classList.toggle("is-match", event.type === "partido");
    eventDetail.classList.toggle("is-home-match", event.isMorera);
    eventTag.textContent = event.type === "cerrado"
      ? "DÍA SIN SERVICIO"
      : event.isMorera
        ? "PARTIDO EN CASA"
        : event.type === "partido" ? "PARTIDO DE PRIMERA" : "EVENTO";
    eventName.textContent = event.title;
    renderEventVisual(event);
    eventDescription.textContent = event.description || (event.type === "cerrado" ? "El bar permanecerá cerrado este día." : event.type === "partido" ? "Viví la Primera División en Bar El Manudito." : "Te esperamos en el bar.");
    eventMeta.textContent = eventMetaText(event);
    return;
  }
  eventDetail.classList.remove("is-closed");
  eventDetail.classList.toggle("is-match", events.some((event) => event.type === "partido"));
  eventDetail.classList.toggle("is-home-match", events.some((event) => event.isMorera));
  eventTag.textContent = events.some((event) => event.type === "partido") ? "PARTIDOS Y EVENTOS" : "EVENTOS";
  eventName.textContent = `${events.length} actividades`;
  eventVisual.replaceChildren();
  eventVisual.hidden = true;
  eventDescription.replaceChildren();
  for (const event of events) {
    const item = document.createElement("article");
    item.className = "event-list-item";
    const visual = event.type === "partido" ? createMatchVisual(event, true) : createEventImage(event, true);
    if (visual) item.append(visual);
    const title = document.createElement("strong");
    title.textContent = event.title;
    const copy = document.createElement("p");
    copy.append(title, document.createTextNode(` · ${eventMetaText(event)}`));
    if (event.isMorera) {
      const badge = document.createElement("span");
      badge.className = "morera-badge is-inline";
      badge.textContent = "EN CASA";
      copy.append(document.createElement("br"), badge);
    }
    if (event.description) copy.append(document.createElement("br"), document.createTextNode(event.description));
    item.append(copy);
    eventDescription.append(item);
  }
  eventMeta.textContent = "Agenda del día";
}

function renderCalendar() {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  calendarTitle.textContent = `${monthNames[month]} ${year}`;
  calendarGrid.innerHTML = "";

  for (let index = 0; index < firstDay; index += 1) {
    const empty = document.createElement("span");
    empty.className = "calendar-empty";
    calendarGrid.append(empty);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = dateKey(year, month, day);
    const events = calendarEventsForKey(key);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.textContent = day;
    button.setAttribute("aria-label", events?.length ? `${day}: ${events.map((event) => event.title).join(", ")}` : `${day} de ${monthNames[month]}`);
    if (!events?.length) button.disabled = true;
    if (events?.length) button.classList.add("has-event");
    if (events?.some((event) => event.type === "partido")) button.classList.add("is-match");
    if (events?.some((event) => event.type === "cerrado")) button.classList.add("is-closed");
    if (events?.some((event) => event.isMorera)) {
      button.classList.add("is-home-match");
      const homeBadge = document.createElement("span");
      homeBadge.className = "calendar-home-badge";
      homeBadge.textContent = "CASA";
      button.append(homeBadge);
    }
    const closedEvent = events?.find((event) => event.type === "cerrado");
    if (closedEvent) {
      const closedImage = createEventImage(closedEvent, true);
      if (closedImage) {
        closedImage.classList.add("calendar-closed-image");
        button.append(closedImage);
      }
    }
    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      button.classList.add("is-today");
      button.setAttribute("aria-current", "date");
    }
    if (events?.length) button.addEventListener("click", () => showEvent(key, button));
    calendarGrid.append(button);
  }
}

document.querySelector("#prev-month")?.addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
  renderCalendar();
});

document.querySelector("#next-month")?.addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
  renderCalendar();
});

const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector("#main-nav");

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Abrir menú de navegación" : "Cerrar menú de navegación");
  mainNav.classList.toggle("is-open", !isOpen);
});

mainNav?.addEventListener("click", (event) => {
  if (!event.target.closest("a")) return;
  mainNav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Abrir menú de navegación");
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileScreen = window.matchMedia("(max-width: 720px)");
const confettiCanvas = document.querySelector("#confetti");
const confettiContext = confettiCanvas.getContext("2d");
let confettiPapers = [];
let animationFrame;
let lastFrame = 0;

const confettiPalette = [
  ["#f20b18", "#780008"],
  ["#ffffff", "#aeb1b7"],
  ["#c9ccd1", "#686c73"],
  ["#c4000d", "#4b0005"],
];

function randomPalette() {
  return confettiPalette[Math.floor(Math.random() * confettiPalette.length)];
}

function createConfettiPaper(randomY = false) {
  const [frontColor, backColor] = randomPalette();
  return {
    x: Math.random() * window.innerWidth,
    y: randomY ? Math.random() * window.innerHeight : -20 - Math.random() * 150,
    width: 5 + Math.random() * 5,
    height: 8 + Math.random() * 8,
    speed: 0.45 + Math.random() * 0.8,
    sway: 0.25 + Math.random() * 0.55,
    phase: Math.random() * Math.PI * 2,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.04,
    frontColor,
    backColor,
    opacity: 0.22 + Math.random() * 0.46,
  };
}

function resizeConfetti() {
  const ratio = Math.min(window.devicePixelRatio || 1, mobileScreen.matches ? 1 : 2);
  confettiCanvas.width = Math.floor(window.innerWidth * ratio);
  confettiCanvas.height = Math.floor(window.innerHeight * ratio);
  confettiCanvas.style.width = `${window.innerWidth}px`;
  confettiCanvas.style.height = `${window.innerHeight}px`;
  confettiContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  const paperCount = mobileScreen.matches
    ? Math.min(24, Math.max(14, Math.round(window.innerWidth / 20)))
    : Math.min(110, Math.max(46, Math.round(window.innerWidth / 15)));
  confettiPapers = Array.from({ length: paperCount }, () => createConfettiPaper(true));
}

function updateConfettiPaper(paper, index) {
  paper.y += paper.speed;
  paper.x += Math.sin(paper.y * 0.012 + paper.phase) * paper.sway;
  paper.rotation += paper.spin;
  if (paper.y > window.innerHeight + 24) {
    confettiPapers[index] = createConfettiPaper(false);
  }
}

function drawPaper(paper) {
  const flip = Math.cos(paper.rotation * 1.7);
  confettiContext.save();
  confettiContext.globalAlpha = paper.opacity;
  confettiContext.translate(paper.x, paper.y);
  confettiContext.rotate(paper.rotation);
  confettiContext.scale(1, Math.max(0.12, Math.abs(flip)));
  confettiContext.fillStyle = flip > 0 ? paper.frontColor : paper.backColor;
  confettiContext.fillRect(-paper.width / 2, -paper.height / 2, paper.width, paper.height);
  confettiContext.restore();
}

function drawConfetti(timestamp = 0) {
  if (document.hidden) {
    animationFrame = undefined;
    return;
  }
  if (timestamp - lastFrame < (mobileScreen.matches ? 48 : 24) && !reduceMotion.matches) {
    animationFrame = requestAnimationFrame(drawConfetti);
    return;
  }
  lastFrame = timestamp;
  confettiContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

  confettiPapers.forEach((paper, index) => {
    if (!reduceMotion.matches) updateConfettiPaper(paper, index);
    drawPaper(paper);
  });

  if (!reduceMotion.matches) animationFrame = requestAnimationFrame(drawConfetti);
}

function restartConfetti() {
  cancelAnimationFrame(animationFrame);
  lastFrame = 0;
  drawConfetti();
}

window.addEventListener("resize", () => {
  resizeConfetti();
  restartConfetti();
});
reduceMotion.addEventListener?.("change", restartConfetti);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) cancelAnimationFrame(animationFrame);
  else restartConfetti();
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0 });

document.querySelectorAll(".reveal").forEach((section) => revealObserver.observe(section));
const currentYear = document.querySelector("#current-year");
if (currentYear) currentYear.textContent = new Date().getFullYear();

renderOrder();
if (calendarGrid) {
  renderCalendar();
  loadCalendar();
}
resizeConfetti();
drawConfetti();
