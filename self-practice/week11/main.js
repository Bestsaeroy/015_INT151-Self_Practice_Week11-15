// Week 1: basic DOM

const workshops = [
  {
    id: "ws1",
    title: "Intro to JavaScript",
    level: "Beginner",
    description:
      "Learn the basics of JavaScript: variables, functions, and simple DOM manipulation."
  },
  {
    id: "ws2",
    title: "UI Design Basics",
    level: "Intermediate",
    description:
      "Understand layout, typography, and visual hierarchy to design better user interfaces."
  },
  {
    id: "ws3",
    title: "REST API with Node.js",
    level: "Advanced",
    description:
      "Build and consume REST APIs using Node.js and Express, including routing and JSON handling."
  }
];

function findWorkshopById(id) {
  return workshops.find(w => w.id === id);
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
      // เปลี่ยน backgroundColor 
      if (row.style.backgroundColor) {
        row.style.backgroundColor = "";
      } else {
        row.style.backgroundColor = "yellow";
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupViewButtons();
  setupHighlightButtons();
});
