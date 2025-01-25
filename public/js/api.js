const API_BASE_URL = "https://magicalitems.onrender.com"; // Backend-Basis-URL

// Helper-Funktion: Fetch-Daten von der API abrufen
export async function fetchData(endpoint, options = {}) {
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
  const isFormData = itemData instanceof FormData; // Prüfen, ob FormData verwendet wird

  return fetchData(`/items/${itemId}`, {
    method: "PUT",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? itemData : JSON.stringify(itemData),
  });
}

// Item löschen
export async function deleteItem(itemId) {
  try {
    const response = await fetch(`${BASE_BACKEND_URL}/items/${itemId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Fehler beim Löschen des Items: ${response.statusText}`);
    }

    return await response.json(); // Rückgabe der API-Antwort (z. B. Erfolgsnachricht)
  } catch (error) {
    console.error("Fehler in deleteItem:", error.message);
    throw error; // Fehler weiterwerfen, falls die aufrufende Funktion ihn behandeln möchte
  }
}

