import { searchItems } from "./api.js";

document.getElementById("search-filter-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Formulardaten
  const formData = new FormData(e.target);
  const search = formData.get("search") || "";
  const minPrice = formData.get("minPrice") || "";
  const maxPrice = formData.get("maxPrice") || "";
  const category_id = formData.get("category_id") || "";

  try {
    // Rufe unsere Funktion aus api.js auf
    const items = await searchItems({ search, minPrice, maxPrice, category_id });

    renderSearchResults(items);
  } catch (error) {
    console.error("Fehler beim Laden der Suchergebnisse:", error);
    const container = document.getElementById("search-results");
    container.innerHTML = "<p>Fehler beim Laden der Items.</p>";
  }
});

function renderSearchResults(items) {
  const container = document.getElementById("search-results");
  container.innerHTML = "";

  if (!items || items.length === 0) {
    container.innerHTML = "<p>Keine passenden Items gefunden.</p>";
    return;
  }

  // Einfacher Loop, kannst du nach Belieben stylen oder layouten
  items.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("item"); // CSS-Klasse

    // Zeige Bild, wenn vorhanden
    const imgHTML = item.image
      ? `<img src="${item.image}" alt="${item.name}" style="max-width: 150px;">`
      : "";

    itemDiv.innerHTML = `
      <h3>${item.name}</h3>
      <p>Preis: ${item.price}</p>
      <p>Mana: ${item.mana}</p>
      <p>${item.description}</p>
      ${imgHTML}
    `;

    container.appendChild(itemDiv);
  });
}
