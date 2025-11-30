// Week 3: fetch workshops.json

let workshops = [];
const registrations = [];

function findWorkshopById(id) {
  return workshops.find(w => w.id === id);
}

async function loadWorkshops() {
  const loadingEl = document.getElementById("loading-message");
  const errorEl = document.getElementById("error-message");
  const list = document.getElementById("workshop-list");

  loadingEl.textContent = "Loading workshops...";
  errorEl.textContent = "";
  list.innerHTML = "";

  try {
    const res = await fetch("./workshops.json");
    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }
    const data = await res.json();
    workshops = data;
    loadingEl.textContent = "";
    renderWorkshops();
    fillWorkshopSelect();
  } catch (err) {
    console.error("Failed to load workshops:", err);
    loadingEl.textContent = "";
    errorEl.textContent = "Cannot load workshop list.";
  }
}

function renderWorkshops() {
  const list = document.getElementById("workshop-list");
  list.innerHTML = "";
  workshops.forEach(ws => {
    const div = document.createElement("div");
    div.dataset.id = ws.id;
    div.innerHTML = `
      <strong>${ws.title}</strong> (${ws.level})
      <button class="btn-view" data-workshop-id="${ws.id}">View detail</button>
      <button class="btn-highlight" data-workshop-id="${ws.id}">Highlight</button>
    `;
    list.appendChild(div);
  });
  setupViewButtons();
  setupHighlightButtons();
}

function setupViewButtons() {
  const detailBox = document.getElementById("detail");
  const viewButtons = document.querySelectorAll(".btn-view");

  viewButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.workshopId;
      const ws = findWorkshopById(id);
      if (!ws) return;
      detailBox.textContent = `${ws.title} (${ws.level}) – ${ws.description}`;
    });
  });
}

function setupHighlightButtons() {
  const highlightButtons = document.querySelectorAll(".btn-highlight");

  highlightButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.workshopId;
      const row = document.querySelector(`[data-id="${id}"]`);
      if (!row) return;
      row.style.backgroundColor = row.style.backgroundColor ? "" : "yellow";
    });
  });
}

function fillWorkshopSelect() {
  const select = document.getElementById("workshop-select");
  select.innerHTML = `<option value="">-- Select workshop --</option>`;
  workshops.forEach(ws => {
    const opt = document.createElement("option");
    opt.value = ws.id;
    opt.textContent = ws.title;
    select.appendChild(opt);
  });
}

function renderRegistrations() {
  const list = document.getElementById("registration-list");
  list.innerHTML = "";

  registrations.forEach(reg => {
    const ws = findWorkshopById(reg.workshopId);
    const li = document.createElement("li");
    const title = ws ? ws.title : reg.workshopId;
    li.textContent = `${reg.userName} → ${title}`;
    list.appendChild(li);
  });
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById("user-name");
  const select = document.getElementById("workshop-select");
  const errorEl = document.getElementById("form-error");

  const userName = nameInput.value.trim();
  const workshopId = select.value;

  errorEl.textContent = "";

  if (!userName) {
    errorEl.textContent = "Please enter your name.";
    return;
  }
  if (!workshopId) {
    errorEl.textContent = "Please select a workshop.";
    return;
  }

  const already = registrations.some(
    reg => reg.userName === userName && reg.workshopId === workshopId
  );
  if (already) {
    errorEl.textContent = "You already registered for this workshop.";
    return;
  }

  registrations.push({ userName, workshopId });
  renderRegistrations();

  nameInput.value = "";
  select.value = "";
}

document.addEventListener("DOMContentLoaded", () => {
  loadWorkshops();
  const form = document.getElementById("register-form");
  form.addEventListener("submit", handleRegisterSubmit);
});
