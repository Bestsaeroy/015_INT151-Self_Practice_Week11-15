// Week 5: Date/Time + registration window

let workshops = [];
const registrations = [];

let pendingCancelIndex = null;
let currentConfirmAction = null;

// registration window สมมติ
const registrationWindow = {
  openTime: new Date("2025-12-01T08:00:00+07:00"),
  closeTime: new Date("2025-12-31T23:59:59+07:00")
};

function findWorkshopById(id) {
  return workshops.find(w => w.id === id);
}

function isRegistrationOpen(now, openTime, closeTime) {
  return now >= openTime && now <= closeTime;
}

function formatDateTimeLocal(date) {
  return date.toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    dateStyle: "medium",
    timeStyle: "short"
  });
}

// mock API
function fakeCancelApi(registration) {
  if (!registration) {
    return { success: false, errorCode: "NOT_FOUND" };
  }
  if (registration.workshopId === "ws2") {
    return { success: false, errorCode: "CANNOT_CANCEL_PAST" };
  }
  return { success: true };
}

// dialog helpers
function openConfirmDialog(message, onConfirm) {
  const dialog = document.getElementById("confirm-dialog");
  const messageEl = document.getElementById("dialog-message");
  messageEl.textContent = message;
  dialog.style.display = "block";
  currentConfirmAction = onConfirm;
}

function closeConfirmDialog() {
  const dialog = document.getElementById("confirm-dialog");
  dialog.style.display = "none";
  currentConfirmAction = null;
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
    // แปลง start/end เป็น Date
    workshops = data.map(w => ({
      ...w,
      startDate: w.start ? new Date(w.start) : null,
      endDate: w.end ? new Date(w.end) : null
    }));
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
  const now = new Date();

  workshops.forEach(ws => {
    const div = document.createElement("div");
    div.dataset.id = ws.id;

    let timeText = "";
    let statusText = "UPCOMING";

    if (ws.startDate && ws.endDate) {
      timeText =
        " | Time: " +
        formatDateTimeLocal(ws.startDate) +
        " → " +
        formatDateTimeLocal(ws.endDate) +
        " (Asia/Bangkok)";

      if (now > ws.endDate) {
        statusText = "ENDED";
      } else if (now >= ws.startDate && now <= ws.endDate) {
        statusText = "IN PROGRESS";
      } else {
        const diffMs = ws.startDate - now;
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours <= 24 && diffHours > 0) {
          statusText = "STARTING SOON";
        }
      }
    }

    div.innerHTML = `
      <strong>${ws.title}</strong> (${ws.level}) [${statusText}] ${timeText}
      <button class="btn-view" data-workshop-id="${ws.id}">View detail</button>
      <button class="btn-highlight" data-workshop-id="${ws.id}">Highlight</button>
    `;
    list.appendChild(div);
  });

  setupViewButtons();
  setupHighlightButtons();
}

function updateRegistrationWindowStatus() {
  const statusEl = document.getElementById("registration-status");
  const now = new Date();

  if (isRegistrationOpen(now, registrationWindow.openTime, registrationWindow.closeTime)) {
    const openStr = formatDateTimeLocal(registrationWindow.openTime);
    const closeStr = formatDateTimeLocal(registrationWindow.closeTime);
    statusEl.textContent =
      "Registration is OPEN now. Period: " +
      openStr +
      " – " +
      closeStr +
      " (Asia/Bangkok)";
  } else {
    const openStr = formatDateTimeLocal(registrationWindow.openTime);
    statusEl.textContent =
      "Registration is CLOSED. Next open period starts at " +
      openStr +
      " (Asia/Bangkok)";
  }
}

function setupViewButtons() {
  const detailBox = document.getElementById("detail");
  const viewButtons = document.querySelectorAll(".btn-view");

  viewButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.workshopId;
      const ws = findWorkshopById(id);
      if (!ws) return;

      const parts = [`${ws.title} (${ws.level})`];
      if (ws.startDate && ws.endDate) {
        parts.push(
          "Time: " +
            formatDateTimeLocal(ws.startDate) +
            " → " +
            formatDateTimeLocal(ws.endDate) +
            " (Asia/Bangkok)"
        );
      }
      parts.push(ws.description || "");

      detailBox.textContent = parts.join(" | ");
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

  registrations.forEach((reg, index) => {
    const ws = findWorkshopById(reg.workshopId);
    const li = document.createElement("li");
    const title = ws ? ws.title : reg.workshopId;
    li.textContent = `${reg.userName} → ${title} `;

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => {
      pendingCancelIndex = index;
      openConfirmDialog(`Cancel registration for ${reg.userName}?`, () => {
        handleConfirmCancel();
      });
    });

    li.appendChild(cancelBtn);
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

  const now = new Date();
  if (!isRegistrationOpen(now, registrationWindow.openTime, registrationWindow.closeTime)) {
    errorEl.textContent = "Registration period is closed.";
    return;
  }

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

function handleConfirmCancel() {
  if (pendingCancelIndex == null) return;
  const registration = registrations[pendingCancelIndex];
  const result = fakeCancelApi(registration);

  const errorEl = document.getElementById("form-error");

  if (!result.success) {
    if (result.errorCode === "CANNOT_CANCEL_PAST") {
      errorEl.textContent =
        "This workshop has already ended and cannot be cancelled.";
    } else if (result.errorCode === "NOT_FOUND") {
      errorEl.textContent = "Registration not found.";
    } else {
      errorEl.textContent = "Unknown error while cancelling.";
    }
  } else {
    registrations.splice(pendingCancelIndex, 1);
    renderRegistrations();
    errorEl.textContent = "";
  }

  pendingCancelIndex = null;
  closeConfirmDialog();
}

document.addEventListener("DOMContentLoaded", () => {
  loadWorkshops();
  updateRegistrationWindowStatus();

  const form = document.getElementById("register-form");
  form.addEventListener("submit", handleRegisterSubmit);

  document.getElementById("dialog-ok").addEventListener("click", () => {
    if (typeof currentConfirmAction === "function") {
      currentConfirmAction();
    }
  });
  document.getElementById("dialog-cancel").addEventListener("click", () => {
    pendingCancelIndex = null;
    closeConfirmDialog();
  });
});
