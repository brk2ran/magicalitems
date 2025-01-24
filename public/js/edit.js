import { fetchData, updateItem } from './api.js';

const form = document.querySelector("#edit-form");

// Hole die Item-ID aus der URL
const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get("id");

if (!itemId) {
    alert("Keine Item-ID gefunden.");
    window.location.href = "index.html";
}

async function loadItem() {
    try {
        // Hole die aktuellen Daten des Items
        const item = await fetchData(`/items/${itemId}`);
        if (item) {
            // Form mit den bestehenden Daten ausfüllen
            form.name.value = item.name;
            form.price.value = item.price;
            form.mana.value = item.mana;
            form.description.value = item.description;
            form.category_id.value = item.category_id;
        } else {
            alert("Item nicht gefunden.");
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("Fehler beim Laden des Items:", error);
        alert("Fehler beim Laden der Daten.");
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Formulardaten sammeln
    const formData = new FormData(form);

    try {
        // Sende die aktualisierten Daten ans Backend
        await updateItem(`${itemId}`, formData);
        alert("Item erfolgreich aktualisiert!");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Items:", error);
        alert("Fehler beim Aktualisieren des Items.");
    }
});

// Item-Daten laden, wenn die Seite geöffnet wird
loadItem();
