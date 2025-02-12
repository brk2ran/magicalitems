const BASE_BACKEND_URL = "https://magicalitems.onrender.com"; // Basis-URL des Backends

// Funktion, um die Item-ID aus der URL zu extrahieren
function getItemIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// Funktion, um die Item-Details aus der API zu laden
async function loadItemDetails() {
    const itemId = getItemIdFromURL();
    const container = document.getElementById("item-details");

    if (!itemId) {
        container.innerHTML = "<p>Keine Item-ID angegeben.</p>";
        return;
    }

    try {
        const response = await fetch(`${BASE_BACKEND_URL}/items/${itemId}`);
        if (!response.ok) throw new Error(`Fehler: ${response.statusText}`);

        const item = await response.json();

        // Dynamisches HTML für das Item
        container.innerHTML = `
        <div class="item-detail-wrapper">
            <div class="item-detail-container">
                <div class="item-detail-image">
                    <img src="${BASE_BACKEND_URL}${item.image}" alt="${item.name}">
                    <div class="back-btn">
                        <a href="#" id="back-link">Zurück zur Kategorie</a>
                    </div>
                </div>
            <div class="item-detail-attributes">
                <h3>${item.name}</h3>
                <p><strong>Preis:</strong> ${item.price} Gold</p>
                <p><strong>Mana:</strong> ${item.mana}</p>
                <p><strong>Beschreibung:</strong> ${item.description}</p>
            </div>
        </div>
        `;

        // Dynamischen Back-Link setzen
        const backLink = document.getElementById("back-link");
        const categoryPath =
            item.category_id === 1 ? "weapons.html" :
            item.category_id === 2 ? "armors.html"  :
            "potions.html";
        backLink.href = `/pages/${categoryPath}`;
    } catch (error) {
        console.error("Fehler beim Laden der Item-Details:", error);
        container.innerHTML = "<p>Fehler beim Laden der Item-Details.</p>";
    }
}

// Initialisierung
document.addEventListener("DOMContentLoaded", loadItemDetails);

