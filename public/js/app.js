const BASE_BACKEND_URL = "https://magicalitems.onrender.com"; // Basis-URL des Backends
/*
// Funktion zum Laden der Kategorien
async function loadCategories() {
  const container = document.getElementById("categories-container");

  try {
    const response = await fetch(`${BASE_BACKEND_URL}/categories`);
    if (!response.ok) throw new Error(`Fehler: ${response.statusText}`);

    const categories = await response.json();

    container.innerHTML = categories
      .map(
        (category) => `
        <div class="category">
          <h2>${category.name}</h2>
          <a href="./category.html?id=${category.id}">Details anzeigen</a>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error("Fehler beim Laden der Kategorien:", error);
    container.innerHTML = `<p>Fehler beim Laden der Kategorien.</p>`;
  }
}
*/

// Funktion zum Laden der Items
async function loadItems() {
  const itemsContainer = document.querySelector(".items-list");

  try {
    const response = await fetch(`${BASE_BACKEND_URL}/items`);
    if (!response.ok) throw new Error(`Fehler: ${response.statusText}`);

    const items = await response.json();

    itemsContainer.innerHTML = items
      .map(
        (item) => `
        <div class="item-card">
          <img src="${BASE_BACKEND_URL}${item.image}" alt="${item.name}">
          <h3>${item.name}</h3>
          <p><strong>Preis:</strong> ${item.price} Gold</p>
          <p><strong>Mana:</strong> ${item.mana}</p>
          <a href="./pages/detail.html?id=${item.id}" class="details-btn">Details ansehen</a>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error("Fehler beim Laden der Items:", error);
    itemsContainer.innerHTML = `<p>Fehler beim Laden der Items.</p>`;
  }
}

// Initialisierung der Inhalte
document.addEventListener("DOMContentLoaded", () => {
  // loadCategories();  // Kategorien laden
  loadItems(); // Items laden
});
