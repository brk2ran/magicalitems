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
          <h2>${item.name}</h2>
          <p>Preis: ${item.price}</p>
          <p>Mana: ${item.mana}</p>
          <p>${item.description}</p>
          <img src="${item.image}" alt="${item.name}" />
          <div class="item-actions">
            <button class="edit-button" onclick="window.location.href='edit.html?id=${item.id}'">Bearbeiten</button>
            <button class="delete-button" onclick="deleteCategoryItem(${item.id})">Löschen</button>
          </div>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error("Fehler beim Laden der Items:", error);
  }
}

// Item löschen
async function deleteCategoryItem(itemId) {
  try {
    if (confirm("Möchtest du dieses Item wirklich löschen?")) {
      await deleteItem(itemId); // Löscht das Item über die API
      alert("Item erfolgreich gelöscht!");
      location.reload(); // Seite neu laden, um die Liste zu aktualisieren
    }
  } catch (error) {
    console.error("Fehler beim Löschen des Items:", error);
    alert("Fehler beim Löschen des Items.");
  }
}

// Beispiel: Kategorie-ID für Waffen
const categoryId = 1; // Waffen = 1, Rüstungen = 2, Tränke = 3
loadCategoryItems(categoryId);
