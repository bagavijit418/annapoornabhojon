const MENU_CSV_URL = "menu.csv";

const CATEGORIES = ["Starters", "Mains", "Dessert"];

function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function imageSrc(value) {
  const v = (value || "").trim();
  if (/^[\w.-]+$/.test(v)) return `images/${v}`;
  return "";
}

function renderMenu(items) {
  const tabs = document.getElementById("menu-tabs");
  const grid = document.getElementById("menu-items");
  tabs.innerHTML = "";

  const show = (category) => {
    grid.innerHTML = "";
    tabs.querySelectorAll("button").forEach((b) =>
      b.classList.toggle("active", b.dataset.category === category));

    items.filter((it) => it.category === category).forEach((it) => {
      const card = document.createElement("article");
      card.className = "dish";

      const src = imageSrc(it.image);
      if (src) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = it.name;
        img.loading = "lazy";
        card.appendChild(img);
      }

      const body = document.createElement("div");
      body.className = "dish-body";

      const head = document.createElement("div");
      head.className = "dish-head";
      const name = document.createElement("h3");
      name.textContent = it.name;
      const price = document.createElement("span");
      price.className = "price";
      price.textContent = it.price ? `£${it.price.replace(/^£/, "")}` : "";
      head.append(name, price);

      const desc = document.createElement("p");
      desc.textContent = it.description;

      body.append(head, desc);

      if (it.veg) {
        const badge = document.createElement("span");
        const isVeg = /^(veg|yes|v|true)$/i.test(it.veg);
        badge.className = `badge ${isVeg ? "veg" : "nonveg"}`;
        badge.textContent = isVeg ? "Veg" : "Non-Veg";
        body.appendChild(badge);
      }

      card.appendChild(body);
      grid.appendChild(card);
    });
  };

  CATEGORIES.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = cat;
    btn.dataset.category = cat;
    btn.addEventListener("click", () => show(cat));
    tabs.appendChild(btn);
  });

  show(CATEGORIES[0]);
}

async function loadMenu() {
  const grid = document.getElementById("menu-items");
  try {
    const res = await fetch(MENU_CSV_URL);
    if (!res.ok) throw new Error(res.status);
    const [header, ...rows] = parseCSV(await res.text());
    const keys = header.map((h) => h.trim().toLowerCase());
    const items = rows
      .map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] || "").trim()])))
      .filter((it) => it.name && it.available?.toLowerCase() !== "no")
      .map((it) => ({
        ...it,
        category: CATEGORIES.find((c) => c.toLowerCase() === it.category?.toLowerCase()) || it.category,
      }));
    renderMenu(items);
  } catch {
    grid.textContent = "Menu is currently unavailable. Please contact us to order.";
  }
}

loadMenu();
