import { fetchData, deleteItem } from "./api.js";

// Funktion zum Laden der Items einer Kategorie
async function loadCategoryItems(categoryId) {
  const itemsList = document.querySelector(".items-list");
  const itemCount = document.getElementById("item-count");

  try {
    // Items für die Kategorie laden
    const items = await fetchData(`/items?category_id=${categoryId}`);
    itemCount.textContent = items.length;

    // Items dynamisch einfügen
    itemsList.innerHTML = items
      .map(
        (item) => `
        <div class="item-card">
          <img src="${item.image}" alt="${item.name}" />
          <h3><strong>${item.name}</strong></h3>
          <p><strong>Preis:</strong> ${item.price}</p>
          <p><strong>Mana:</strong> ${item.mana}</p>
          <p>${item.description}</p>
          <button class="details-btn" onclick="window.location.href='detail.html?id=${item.id}'">Details ansehen</button>
          <div class="action-buttons">
            <button class="edit-btn" onclick="window.location.href='edit.html?id=${item.id}'">Bearbeiten</button>
            <button class="delete-btn" onclick="deleteCategoryItem(${item.id})">Löschen</button>
          </div>
        </div>
      `)
      .join("");
  } catch (error) {
    console.error("Fehler beim Laden der Items:", error);
  }
}

// Item löschen
export async function deleteCategoryItem(itemId) {
  try {
    const confirmation = confirm("Möchtest du dieses Item wirklich löschen?");
    if (!confirmation) return;

    const result = await deleteItem(itemId);
    alert(result.message || "Item erfolgreich gelöscht!");

    // Items-Liste neu laden
    loadCategoryItems(categoryId); // Falls vorhanden, aktualisiert die Liste
  } catch (error) {
    alert("Fehler beim Löschen des Items. Bitte versuche es erneut.");
  }
}

// Kategorie-ID dynamisch basierend auf der Seite setzen
let categoryId;

if (window.location.pathname.includes("weapons.html")) {
  categoryId = 1; // Waffen
} else if (window.location.pathname.includes("armors.html")) {
  categoryId = 2; // Rüstungen
} else if (window.location.pathname.includes("potions.html")) {
  categoryId = 3; // Tränke
}

// Lade die Items für die jeweilige Kategorie
if (categoryId) {
  loadCategoryItems(categoryId);
} else {
  console.error("Kategorie konnte nicht bestimmt werden.");
}

window.deleteCategoryItem = deleteCategoryItem;

