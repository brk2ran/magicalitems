const API_BASE_URL = "https://magicalitems.onrender.com"; // Backend-Basis-URL

// Helper-Funktion: Fetch-Daten von der API abrufen
async function fetchData(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`Fehler: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API-Fehler:", error.message);
    throw error;
  }
}

// Kategorien abrufen
export async function getCategories() {
  return fetchData("/categories");
}

// Items abrufen
export async function getItems() {
  return fetchData("/items");
}

// Items nach Kategorie abrufen
export async function getItemsByCategory(categoryId) {
  return fetchData(`/categories/${categoryId}/items`);
}

// Details eines Items abrufen
export async function getItemDetails(itemId) {
  return fetchData(`/items/${itemId}`);
}

/*// Neues Item erstellen
export async function createItem(itemData) {
  return fetchData("/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(itemData),
  });
}*/

// Neues Item erstellen
export async function createItem(itemData) {
  const isFormData = itemData instanceof FormData; // Prüfen, ob FormData verwendet wird

  return fetchData("/items", {
    method: "POST",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? itemData : JSON.stringify(itemData),
  });
}


// Item aktualisieren
export async function updateItem(itemId, itemData) {
  return fetchData(`/items/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(itemData),
  });
}

// Item löschen
export async function deleteItem(itemId) {
  return fetchData(`/items/${itemId}`, {
    method: "DELETE",
  });
}
