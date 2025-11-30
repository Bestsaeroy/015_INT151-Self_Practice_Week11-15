const d1 = new Date();
const d2 = new Date(Date.now());
const d3 = new Date("2025-12-09");
const d4 = new Date("2025-12-09T10:25:00");
const d5 = new Date("2025-12-09T10:25:00+07:00");

const dates = { d1, d2, d3, d4, d5 };

for (const [name, d] of Object.entries(dates)) {
  console.log("=== " + name + " ===");
  console.log("toString():", d.toString());
  console.log("toISOString():", d.toISOString());
  console.log("getTime():", d.getTime());
  console.log("");
}

const sample = new Date("2025-12-30T15:50:45");
console.log(
  "th-TH Asia/Bangkok:",
  sample.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })
);
console.log(
  "en-US New York:",
  sample.toLocaleString("en-US", { timeZone: "America/New_York" })
);
