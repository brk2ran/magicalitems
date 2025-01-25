import { fetchData, deleteItem } from "./api.js";

// Funktion zum Laden der Items einer Kategorie
async function loadCategoryItems(categoryId) {
  console.log("Lade Items für Kategorie-ID:", categoryId);
  const itemsList = document.querySelector(".items-list");
  const itemCount = document.getElementById("item-count");

  try {
    // API-Aufruf, um Items für die Kategorie zu laden
    const items = await fetchData(`/items?category_id=${categoryId}`);
    console.log("Geladene Items:", items);

    // Anzahl der Items anzeigen
    itemCount.textContent = items.length;

    // Items dynamisch in das HTML einfügen
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
      `
      )
      .join("");
    console.log("Items erfolgreich gerendert.");
  } catch (error) {
    console.error("Fehler beim Laden der Items:", error);
  }
}

// Item löschen
export async function deleteCategoryItem(itemId) {
  console.log("Lösche Item mit ID:", itemId);
  try {
    const confirmation = confirm("Möchtest du dieses Item wirklich löschen?");
    if (!confirmation) {
      console.log("Löschvorgang abgebrochen.");
      return;
    }

    const result = await deleteItem(itemId);
    console.log("Item erfolgreich gelöscht:", result);

    alert(result.message || "Item erfolgreich gelöscht!");

    // Seite neu laden, um die Liste zu aktualisieren
    loadCategoryItems(categoryId);
  } catch (error) {
    console.error("Fehler beim Löschen des Items:", error);
    alert("Fehler beim Löschen des Items. Bitte versuche es erneut.");
  }
}

// Kategorie-ID dynamisch basierend auf der Seite setzen
let categoryId;

// Debugging: Aktuellen Pfad ausgeben
console.log("Aktueller Pfad:", window.location.pathname);

if (window.location.pathname.includes("weapons.html")) {
  categoryId = 1; // Waffen
} else if (window.location.pathname.includes("armors.html")) {
  categoryId = 2; // Rüstungen
} else if (window.location.pathname.includes("potions.html")) {
  categoryId = 3; // Tränke
}

// Debugging: Kategorie-ID prüfen
if (categoryId) {
  console.log("Ermittelte Kategorie-ID:", categoryId);
  loadCategoryItems(categoryId);
} else {
  console.error("Kategorie konnte nicht bestimmt werden. Überprüfe den Pfad:", window.location.pathname);
}

// deleteCategoryItem global verfügbar machen
window.deleteCategoryItem = deleteCategoryItem;
