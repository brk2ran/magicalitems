const BASE_BACKEND_URL = "https://magicalitems.onrender.com"; // Basis-URL des Backends

// Funktion zum Laden der Kategorien
async function loadCategories() {
    const categorySelect = document.getElementById("category");

    try {
        const response = await fetch(`${BASE_BACKEND_URL}/categories`);
        if (!response.ok) throw new Error(`Fehler: ${response.statusText}`);

        const categories = await response.json();

        // Kategorien als Optionen hinzufügen
        categorySelect.innerHTML = categories
            .map(category => `<option value="${category.id}">${category.name}</option>`)
            .join("");
    } catch (error) {
        console.error("Fehler beim Laden der Kategorien:", error);
        categorySelect.innerHTML = `<option value="">Kategorien konnten nicht geladen werden</option>`;
    }
}

// Funktion zum Absenden des Formulars
async function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    try {
        const response = await fetch(`${BASE_BACKEND_URL}/items`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Fehler beim Erstellen des Items: ${response.statusText}`);
        }

        const item = await response.json();
        alert("Item erfolgreich erstellt!");
        window.location.href = "../index.html"; // Weiterleitung zur Startseite
    } catch (error) {
        console.error(error);
        alert("Fehler beim Erstellen des Items. Bitte versuchen Sie es erneut.");
    }
}

// Event-Listener hinzufügen
document.addEventListener("DOMContentLoaded", () => {
    loadCategories(); // Kategorien laden
    const form = document.getElementById("item-form");
    form.addEventListener("submit", handleFormSubmit);
});
